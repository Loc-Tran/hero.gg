import React, { Component } from 'react'
let DOTA2_CDN = "http://cdn.dota2.com";  

export class HeroTable extends Component {
  

   constructor(props) {
      super(props)
      this.state = {
         heroes: [],
         heroStats: [],
         tableKeys: ["Rank", "Hero", "Roles", "Play Percent", "Ban Rate", "Playerbase Avg. Games"],
         highestElo: "7" // 7 (Divine) is highest before Immortal (challenger of DotA), this should be set in App
      }
   }

    componentDidMount() {
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
    }


  
  renderTableData() {
      return this.state.heroes.map((hero, index) => {
         const { id, localized_name, roles } = hero //destructuring
         let herostats;
         if (this.state.heroStats && this.state.heroStats.length > 0) {
           herostats = this.state.heroStats[index]
         }
         
         let img = "";
         let winrate = NaN;
         let playpercentage = NaN;
         
         if (herostats) {
           img = DOTA2_CDN + herostats.icon;
           
         }
         
         return (
            <tr key={id}>
               <td>{id}</td>
               <td><img alt={localized_name} src={img} />{localized_name}</td>
               <td>{roles}</td>
               
            </tr>
         )
      })
   }

   calculateWinRate(herostats) {
     
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

