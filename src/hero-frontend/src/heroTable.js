import React, { Component } from 'react'
let DOTA2_CDN = "http://cdn.dota2.com";  

export class HeroTable extends Component {
   calculateTotalGames() {
     let retval = 0;
     let minimumElo = this.state.minimumElo;
     let i;
     
     for(i = 0; i < this.state.heroStats.length; i++) {
       let j;
       for(j = minimumElo; j <= 7; j++) {
         retval += this.state.heroStats[i][j.toString() + "_pick"];
       }
     }
     return retval;
   }

     constructor(props) {
      super(props)
      
      this.state = {
         heroes: [],
         heroStats: [],
         benchMarks: [],
         tableKeys: ["Rank", "Hero", "Roles", "Win Rate", "Play Percent", "Kills/Min", "Dmg/Min", "Tower Dmg", "Gold/Min", "EXP/Min", "CS/Min", "Healing/Min"],
         minimumElo: 6 // 7 (Divine) is highest before Immortal (challenger of DotA), this should be set in App
      }
      
      fetch('http://localhost:5000/api/hero/heroinfo')
      .then(res => res.json())
      .then((data) => {
        this.setState({ heroes: data })
      })
      .catch(console.log)
      
      fetch('http://localhost:5000/api/hero/herostats')
      .then(res => res.json())
      .then((data) => {
        this.setState({ heroStats: data })
      })
      .catch(console.log)
      
      fetch('http://localhost:5000/api/hero/benchmarks')
      .then(res => res.json())
      .then((data) => {
        this.setState({ benchMarks: data })
      })
      .catch(console.log)
     
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
      let totalGames = this.calculateTotalGames();
      return this.state.heroes.map((hero, index) => {
         const { id, localized_name, roles } = hero //destructuring
         let herostats;
         
         if (this.state.heroStats && this.state.heroStats.length > 0) {
           herostats = this.state.heroStats[index];
         }
         
         let benchMark;
         if (this.state.benchMarks && this.state.benchMarks.length > 0) {
           benchMark = this.state.benchMarks[index]["result"];
         }
         
         let img = "";
         let winrate;
         let playpercentage;

         if (herostats) {
           img = DOTA2_CDN + herostats.icon;
           let pickTotal = this.calculatePickTotal(herostats);
           let winTotal = this.calculateWinTotal(herostats);
           winrate = ((winTotal*1.0 / pickTotal) * 100).toFixed(2);
           playpercentage = ((pickTotal*1.0 / totalGames) * 100).toFixed(2);
         }
         
         
         let dmgPerMin;
         let towerDmg;
         let goldPerMin;
         let expPerMin;
         let killsPerMin;
         let csPerMin;
         let healingPerMin;
         
         if (benchMark) {
           dmgPerMin = benchMark.hero_damage_per_min[4];
           towerDmg = benchMark.tower_damage[4];
           killsPerMin = benchMark.kills_per_min[4];
           goldPerMin = benchMark.gold_per_min[4];
           expPerMin = benchMark.xp_per_min[4];
           csPerMin = benchMark.last_hits_per_min[4];
           healingPerMin = benchMark.hero_healing_per_min[4];
         }
         
         // tableKeys: ["Rank", "Hero", "Roles", "Win Rate", "Play Percent", "Kills/Min", "Dmg/Min", "Tower Dmg", "Gold/Min", "EXP/Min", "CS/Min", "Healing/Min"]
         return (
            <tr key={id}>
               <td>{id}</td>
               <td><img alt={localized_name} src={img} />{localized_name}</td>
               <td>{roles}</td>
               <td>{winrate}%</td>
               <td>{playpercentage}%</td>
               <td>{killsPerMin}</td>
               <td>{dmgPerMin}</td>
               <td>{towerDmg}</td>
               <td>{goldPerMin}</td>
               <td>{expPerMin}</td>
               <td>{csPerMin}</td>
               <td>{healingPerMin}</td>
            </tr>
         )
      })
   }
   
   renderTableHeader() {
      return this.state.tableKeys.map((key, index) => {
         return <th key={index}>{key.toUpperCase()}</th>
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

