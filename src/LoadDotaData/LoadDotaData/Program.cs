using System;
using MongoDB.Bson;
using MongoDB.Driver;
using RestSharp;
using Newtonsoft.Json;
using Newtonsoft.Json.Bson;
using System.Linq;

namespace LoadDotaData
{
    class Program
    {
        static readonly int NUMBER_OF_DOTA_HEROES = 115; // make sure to update this when new heroes are added

        public static bool CollectionExists(IMongoDatabase mongoDatabase, string collectionName)
        {
            var filter = new BsonDocument("name", collectionName);
            //filter by collection name
            var collections = mongoDatabase.ListCollections(new ListCollectionsOptions { Filter = filter });
            //check for existence
            return collections.Any();
        }

        public static string RestAPICall(string url, string restPath, Method restMethod)
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

        // this only works if we can bulk load data for all heroes in one json
        public static void CreateCollection(IMongoDatabase database, string collectionName, string openDotaRestPath)
        {
            database.CreateCollection(collectionName);
            var collection = database.GetCollection<BsonDocument>(collectionName);
            var content = RestAPICall("https://api.opendota.com", openDotaRestPath, Method.GET);
            dynamic dynJson = JsonConvert.DeserializeObject(content);
            foreach (var item in dynJson)
            {
                BsonDocument doc = BsonDocument.Parse(item.ToString());
                collection.InsertOne(doc);
            }
        }

        public static void CreateCollection(IMongoDatabase database, string collectionName, string prefix, string suffix)
        {
            database.CreateCollection(collectionName);
            var collection = database.GetCollection<BsonDocument>(collectionName);
            for (int i = 0; i < NUMBER_OF_DOTA_HEROES; )
            {
                var content = RestAPICall("https://api.opendota.com", prefix + i.ToString() + suffix, Method.GET);

                if (content.Contains("error"))
                {
                    // opendota rate limits 50 requests per minute, just wait for a minute then try again
                    System.Threading.Thread.Sleep(60000);
                    continue;
                }

                dynamic dynJson = JsonConvert.DeserializeObject(content);
                foreach (var item in dynJson)
                {
                    BsonDocument doc = BsonDocument.Parse(item.ToString());
                    doc.Add(new BsonElement("hero_id", i));
                    collection.InsertOne(doc);
                }

                i++;
            }
        }

        // since opendota will limit call at 5000 per month, just save all 
        // we need and use what is in the cache if we already have something
        // there
        // https://docs.opendota.com/ more info
        public static void PopulateCache()
        {
            // check if there are values assigned for HeroController
            var client = new MongoClient(
                "mongodb://127.0.0.1:27017/"
            );

            var database = client.GetDatabase("herodb");
            if (!CollectionExists(database, "heroes"))
            {
                CreateCollection(database, "heroes", "/api/heroes");
            }

            if (!CollectionExists(database, "heroesStats"))
            {
                CreateCollection(database, "heroesStats", "/api/heroStats");
            }

            if (!CollectionExists(database, "itemTimings"))
            {
                CreateCollection(database, "itemTimings", "/api/scenarios/itemTimings");
            }

            if (!CollectionExists(database, "laneRoles"))
            {
                CreateCollection(database, "laneRoles", "/api/scenarios/laneRoles");
            }

            // this is broken because results come as an array with all relevant 
            // pro matches but don't really need this right now
            //if (!CollectionExists(database, "matches"))
            //{
            //    CreateCollection(database, "matches", "/api/heroes/", "/matches", count);
            //}


            if (!CollectionExists(database, "durations"))
            {
                CreateCollection(database, "durations", "/api/heroes/", "/durations");
            }

            // this works but we don't really need this 
            //if (!CollectionExists(database, "players"))
            //{
            //    CreateCollection(database, "players", "/api/heroes/", "/players");
            //}
        }


        static void Main(string[] args)
        {
            PopulateCache();
        }
    }
}
