using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace hero_backend.Controllers
{
    [Route("dota/[controller]")]
    [ApiController]
    public class HeroController : ControllerBase
    {
        public string GenerateKey(string heroName)
        {
            return $"dota/hero/{heroName}";
        }

        // GET dota/values
        //[HttpGet]
        //public ActionResult<IEnumerable<string>> Get()
        //{
        //    return new string[] { "value1", "value2" };
        //}

        // GET dota/hero/sandking
        [HttpGet("{heroName}")]
        public ActionResult<string> Get(string heroName)
        {

            return "string heroName";
        }

        // GET dota/hero/sandking/safelane
        [HttpGet("{heroName}/{lane}")]
        public ActionResult<string> Get(string heroName, string laneName)
        {
            return "string heroName, string laneName";
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
