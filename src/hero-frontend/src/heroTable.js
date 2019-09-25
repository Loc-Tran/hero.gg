import React, { Component } from 'react'
let DOTA2_CDN = "http://cdn.dota2.com";  

export class HeroTable extends Component {
     constructor(props) {
      super(props);
      
      this.keys = [null, "localized_name", "winrate", "playpercentage", "killsPerMin", "dmgPerMin", "towerDmg", "goldPerMin", "expPerMin", "csPerMin", "healingPerMin"];
      this.tableKeys = ["Rank", "Hero", "Win Rate", "Play Percent", "Kills/Min", "Dmg/Min", "Tower Dmg", "Gold/Min", "EXP/Min", "CS/Min", "Healing/Min"];
      this.state = {
         heroDataAggregations: [],
         minimumElo: 6, // 7 (Divine) is highest before Immortal (challenger of DotA), this should be set in App
         lastColumnClicked: "",
         filterValue: ""
      }
      
      this.onSort = this.onSort.bind(this);
      this.onChange = this.onChange.bind(this);
   }
   
   onChange(event) {
    this.setState({filterValue: event.target.value})
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

         object.localized_name = hero.localized_name;
         object.img = DOTA2_CDN + herostats.icon;
         let pickTotal = this.calculatePickTotal(herostats);
         let winTotal = this.calculateWinTotal(herostats);
         object.winrate = ((winTotal*1.0 / pickTotal) * 100).toFixed(2);
         object.playpercentage = ((pickTotal*1.0 / totalGames) * 100).toFixed(2);
        
         if (benchMark.hero_damage_per_min[4].value != null) { // if one is null, all of them are, opendota doesn't support benchmarks for the most recent heroes
           object.dmgPerMin = parseFloat(benchMark.hero_damage_per_min[4].value.toFixed(2));
           object.towerDmg = benchMark.tower_damage[4].value;
           object.killsPerMin = parseFloat(benchMark.kills_per_min[4].value.toFixed(2));
           object.goldPerMin = benchMark.gold_per_min[4].value;
           object.expPerMin = benchMark.xp_per_min[4].value;
           object.csPerMin = parseFloat(benchMark.last_hits_per_min[4].value.toFixed(2));
           object.healingPerMin = parseFloat(benchMark.hero_healing_per_min[4].value.toFixed(2));
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
         if (hero.localized_name.toLowerCase().includes(this.state.filterValue.toLowerCase())) {
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
         }
      })
   }
   
   
   onSort(sortKeyIndex) {
    const sortKey = this.keys[sortKeyIndex];
    if(sortKey === null){
      return
    }
    const heroDataAggs = this.state.heroDataAggregations;
    if (this.state.lastColumnClicked === sortKey) {
      heroDataAggs.sort((a,b) => a[sortKey] > b[sortKey]);
      this.state.lastColumnClicked = ""; // want to sort as if we didn't click on the column at all if we clicked on it the third time
    } else {
      heroDataAggs.sort((a,b) => a[sortKey] < b[sortKey]);
      this.state.lastColumnClicked = sortKey;
    }
      
    this.setState({heroDataAggregations : heroDataAggs})
  }
   
   renderTableHeader() {
      return this.tableKeys.map((key, index) => {
         return <th key={key} onClick={() => this.onSort(index)}>{key.toUpperCase()}</th>
      })
   }

   render() {
      return (
         <div>
            <input type="text" placeholder='Filter by Hero Name' value={this.state.filterValue} onChange={this.onChange} />
            <table class="heavyTable">
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

