using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using RestSharp;
using Newtonsoft.Json;
using Newtonsoft.Json.Bson;

namespace hero_backend
{
    public class Program
    {
        public static bool CollectionExists(IMongoDatabase mongoDatabase, string collectionName)
        {
            var filter = new BsonDocument("name", collectionName);
            //filter by collection name
            var collections = mongoDatabase.ListCollections(new ListCollectionsOptions { Filter = filter });
            //check for existence
            return collections.Any();
        }

        public static string OpenDotaAPICall(string url, string restPath, Method restMethod)
        {
            var client = new RestClient(url);
            // client.Authenticator = new HttpBasicAuthenticator(username, password);

            var request = new RestRequest(restPath, restMethod);
            //request.AddParameter("name", "value"); // adds to POST or URL querystring based on Method
            //request.AddUrlSegment("id", "123"); // replaces matching token in request.Resource

            // easily add HTTP Headers
            //request.AddHeader("header", "value");

            // add files to upload (works with compatible verbs)
            //request.AddFile(path);

            // execute the request
            IRestResponse response = client.Execute(request);
            return response.Content; // raw content as string
        }

        public static void PopulateCache()
        {
            // check if there are values assigned for HeroController
            var client = new MongoClient(
                "mongodb://127.0.0.1:27017/"
            );

            var database = client.GetDatabase("herodb");
            if (!CollectionExists(database, "id_to_hero_mapping")) // assume if this exists, everything else has been initiated
            {
                var content = OpenDotaAPICall("https://api.opendota.com", "/api/heroes", Method.GET);
                JsonTextReader reader = new JsonTextReader(new StringReader(content));
                while (reader.Read())
                {
                    if (reader.Value != null)
                    {
                        Console.WriteLine("Token: {0}, Value: {1}", reader.TokenType, reader.Value);
                    }
                    else
                    {
                        Console.WriteLine("Token: {0}", reader.TokenType);
                    }
                }
            }
        }

        public static void Main(string[] args)
        {
            PopulateCache();
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>();
    }
}
