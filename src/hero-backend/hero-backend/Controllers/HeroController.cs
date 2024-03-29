﻿using System.Linq;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
namespace hero_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HeroController : ControllerBase
    {
        private readonly MongoClient client;
        private readonly IMongoDatabase database;

        private ActionResult<string> GetDocument(string collectionName, BsonDocument filter)
        {
            var collection = database.GetCollection<BsonDocument>(collectionName);
            var obj = collection.Find(filter).FirstOrDefault();
            if (obj == null)
            {
                return NotFound();
            }

            // remove mongoDB uuid
            obj.Remove("_id");
            return Ok(obj.ToJson());
        }

        private ActionResult<string> GetMultipleDocuments(string collectionName, BsonDocument filter)
        {
            var collection = database.GetCollection<BsonDocument>(collectionName);
            var objs = collection.Find(filter);
            if (objs.CountDocuments() == 0)
            {
                return NotFound();
            }
            
            var iterator = objs.ToEnumerable();

            // this is hacky but no idea to figure it out
            var retval = new List<BsonDocument>();
            foreach (var json in iterator)
            {
                json.Remove("_id");
                retval.Add(json);
            }

            return Ok(retval.ToJson());
        }


        public HeroController()
        {
             client = new MongoClient("mongodb://127.0.0.1:27017/");
             database = client.GetDatabase("herodb");
        }

        [HttpGet("heroinfo/{heroName}")]
        public ActionResult<string> GetHero(string heroName)
        {
            return GetDocument("heroes", new BsonDocument("localized_name", heroName));
        }

        [HttpGet("benchmarks/")]
        public ActionResult<string> GetAllHeroBenchMarks()
        {
            return GetMultipleDocuments("benchmarks", new BsonDocument());
        }

        [HttpGet("heroinfo/")]
        public ActionResult<string> GetAllHeroes()
        {
            return GetMultipleDocuments("heroes", new BsonDocument());
        }

        [HttpGet("herostats/")]
        public ActionResult<string> GetAllHeroStats()
        {
            return GetMultipleDocuments("heroesStats", new BsonDocument());
        }

        [HttpGet("herostats/{heroId}")]
        public ActionResult<string> GetHeroStats(int heroId)
        {
            return GetDocument("heroesStats", new BsonDocument("id", heroId));
        }

        [HttpGet("itemtiming/{heroId}")]
        public ActionResult<string> GetItemTiming(int heroId)
        {
            return GetMultipleDocuments("itemTimings", new BsonDocument("hero_id", heroId));
        }

        [HttpGet("laneroles/{heroId}")]
        public ActionResult<string> GetLaneRoles(int heroId)
        {
            return GetMultipleDocuments("laneRoles", new BsonDocument("hero_id", heroId));
        }

        [HttpGet("durations/{heroId}")]
        public ActionResult<string> GetHeroDurations(int heroId)
        {
            return GetMultipleDocuments("durations", new BsonDocument("hero_id", heroId));
        }


        [HttpGet("benchmarks/{heroId}")]
        public ActionResult<string> GetHeroBenchMarks(int heroId)
        {
            return GetDocument("benchmarks", new BsonDocument("hero_id", heroId));
        }

        // POST api/hero
        //[HttpPost]
        //public void Post([FromBody] string value)
        //{
        //}

        // PUT api/hero/5
        //[HttpPut("{id}")]
        //public void Put(int id, [FromBody] string value)
        //{
        //}

        // DELETE api/hero/5
        //[HttpDelete("{id}")]
        //public void Delete(int id)
        //{
        //}
    }
}
