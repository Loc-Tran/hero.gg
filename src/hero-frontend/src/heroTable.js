import React, { Component } from 'react'
let DOTA2_CDN = "http://cdn.dota2.com";  

export class HeroTable extends Component {
     constructor(props) {
      super(props)
      
      this.state = {
         heroDataAggregations: [],
         keys: [null, "img", "winrate", "playpercentage", "killsPerMin", "dmgPerMin", "towerDmg", "goldPerMin", "expPerMin", "csPerMin", "healingPerMin"],
         tableKeys: ["Rank", "Hero", "Win Rate", "Play Percent", "Kills/Min", "Dmg/Min", "Tower Dmg", "Gold/Min", "EXP/Min", "CS/Min", "Healing/Min"],
         minimumElo: 6 // 7 (Divine) is highest before Immortal (challenger of DotA), this should be set in App
      }
      
      this.onSort = this.onSort.bind(this);
   }
   
   async logFetch(url) {
    try {
      const response = await fetch(url);
      return await response.json();
    }
    catch (err) {
      console.log('fetch failed', err);
    }
  }

   calculateTotalGames(heroStats) {
     let retval = 0;
     let minimumElo = this.state.minimumElo;
     let i;
     
     for(i = 0; i < heroStats.length; i++) {
       let j;
       for(j = minimumElo; j <= 7; j++) {
         retval += heroStats[i][j.toString() + "_pick"];
       }
     }
     return retval;
   }
   
   componentDidUpdate() {
   }
   
   async componentDidMount() {
      let heroes = await this.logFetch('http://localhost:5000/api/hero/heroinfo');
      let heroStats = await this.logFetch('http://localhost:5000/api/hero/herostats');
      let benchMarks = await this.logFetch('http://localhost:5000/api/hero/benchmarks');
      // parse api data here
      const heroDataAggs = [];
      let totalGames = this.calculateTotalGames(heroStats);
      heroes.map((hero, index) => {
         let object = {};
         let herostats = heroStats[index];
         let benchMark = benchMarks[index].result;

         if (herostats) {
           object.localized_name = hero.localized_name;
           object.img = DOTA2_CDN + herostats.icon;
           let pickTotal = this.calculatePickTotal(herostats);
           let winTotal = this.calculateWinTotal(herostats);
           object.winrate = ((winTotal*1.0 / pickTotal) * 100).toFixed(2);
           object.playpercentage = ((pickTotal*1.0 / totalGames) * 100).toFixed(2);
         }
        
         if (benchMark && benchMark.hero_damage_per_min[4].value != null) { // if one is null, all of them are, opendota doesn't support benchmarks for the most recent heroes
           object.dmgPerMin = parseFloat(benchMark.hero_damage_per_min[4].value.toFixed(2));
           object.towerDmg = benchMark.tower_damage[4].value;
           object.killsPerMin = parseFloat(benchMark.kills_per_min[4].value.toFixed(2));
           object.goldPerMin = benchMark.gold_per_min[4].value;
           object.expPerMin = benchMark.xp_per_min[4].value;
           object.csPerMin = parseFloat(benchMark.last_hits_per_min[4].value.toFixed(2));
           object.healingPerMin = benchMark.hero_healing_per_min[4].value;
         } else {
           object.dmgPerMin = "0.0";
           object.towerDmg = "0.0";
           object.killsPerMin = "0.0";
           object.goldPerMin = "0.0";
           object.expPerMin = "0.0";
           object.csPerMin = "0.0";
           object.healingPerMin = "0.0";
         }
         
         heroDataAggs.push(object);
       })
       this.setState({ heroDataAggregations: heroDataAggs })
  }

   
   calculatePickTotal(herostats) {
     let minimumElo = this.state.minimumElo;
     let pickTotal = 0;
     // 7 is highest rank (divine)
     for(; minimumElo <= 7; minimumElo++) {
       pickTotal += herostats[minimumElo.toString() + "_pick"];
     }
     
     return pickTotal;
   }
   
   calculateWinTotal(herostats) {
     let minimumElo = this.state.minimumElo;
     let wonGames = 0;
     // 7 is highest rank (divine)
     for(; minimumElo <= 7; minimumElo++) {
       wonGames += herostats[minimumElo.toString() + "_win"];
     }
     
     return wonGames;
   }
  
  renderTableData() {
      return this.state.heroDataAggregations.map((hero, index) => {
         // tableKeys: ["Rank", "Hero", "Roles", "Win Rate", "Play Percent", "Kills/Min", "Dmg/Min", "Tower Dmg", "Gold/Min", "EXP/Min", "CS/Min", "Healing/Min"]
         return (
            <tr key={index}>
               <td>{index + 1}</td>
               <td><img alt={hero.localized_name} src={hero.img} />{hero.localized_name}</td>
               <td>{hero.winrate}%</td>
               <td>{hero.playpercentage}%</td>
               <td>{hero.killsPerMin}</td>
               <td>{hero.dmgPerMin}</td>
               <td>{hero.towerDmg}</td>
               <td>{hero.goldPerMin}</td>
               <td>{hero.expPerMin}</td>
               <td>{hero.csPerMin}</td>
               <td>{hero.healingPerMin}</td>
            </tr>
         )
      })
   }
   
   
   onSort(sortKeyIndex) {
    /*
    assuming your data is something like
    [
      {accountname:'foo', negotiatedcontractvalue:'bar'},
      {accountname:'monkey', negotiatedcontractvalue:'spank'},
      {accountname:'chicken', negotiatedcontractvalue:'dance'},
    ]
    */
    const sortKey = this.state.keys[sortKeyIndex];
    if(sortKey === null || sortKey === "img"){
      return
    }
    const heroDataAggs = this.state.heroDataAggregations;
    heroDataAggs.sort((a,b) => a[sortKey] < b[sortKey])
    this.setState({heroDataAggregations : heroDataAggs})
  }
   
   renderTableHeader() {
      return this.state.tableKeys.map((key, index) => {
         return <th key={key} onClick={() => this.onSort(index)}>{key.toUpperCase()}</th>
      })
   }

   render() {
      return (
         <div>
            <h1 id='title'>hero.gg</h1>
            <table id='heroes'>
               <tbody>
                  <tr>{this.renderTableHeader()}</tr>
                  {this.renderTableData()}
               </tbody>
            </table>
         </div>
      )
   }
}

export default HeroTable

