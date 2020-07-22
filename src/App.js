import React,{useState, useEffect} from 'react';
import {MenuItem,FormControl,Select,Card,CardContent} from "@material-ui/core";
import InfoBox from './components/InfoBox';
import Map from './components/Map';
import Table from './components/Table';
import LineGraph from './components/LineGraph';
import {sortData,prettyPrintStat} from './components/util';

import './App.css';
import "leaflet/dist/leaflet.css";

function App() {

  const [countries,setCountries] = useState([]);
  const [country,setCountry] = useState('worldwide');
  const [countryInfo,setCountryInfo] = useState({});
  const [tableData,setTableData] = useState([]);
  const [mapCenter,setMapCenter] = useState({ lat: 34.80746, lng:-40.4796});
  const [mapZoom,setMapZoom] = useState(3);
  const [mapCountries,setMapCountries] = useState([]);
  const [caseType,setCasesType] = useState("cases");
  
  useEffect (() => {
      fetch('https://disease.sh/v3/covid-19/all').then(response => response.json()).then(data => {setCountryInfo(data)});
  }, []);

  useEffect(() => {
      const getCountriesData = async () => {
          await fetch ("https://disease.sh/v3/covid-19/countries").then((response) => response.json())
          .then((data) =>{
               const countries = data.map((country) => ({
                   name : country.country,
                   value : country.countryInfo.iso2
                }));
   
          const sortedData = sortData(data);   

          setTableData(sortedData);     
          setCountries(countries);   
          setMapCountries(data);
          
          });
      };

      getCountriesData();
    },[]);

    const onCountryChange = async (event) => {
        const countrycode = event.target.value;
        setCountry(countrycode);

        const url = countrycode === "Worldwide" ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countrycode}`;

        await fetch(url).then(response => response.json()).then(data => {
          setCountryInfo(data);
          setCountry(countrycode);

          setMapCenter([data.countryInfo.lat,data.countryInfo.long]);
          setMapZoom(4);
        });
    };

  return ( 
    <div className = "app">

    <div className =  "app__left">
      <div className="app__header">
          <h1>COVID19 TRACKER</h1>
          <FormControl className="app-dropdown">
              <Select 
                variant="outlined"
                onChange = {onCountryChange}
                value={country}   
              >  
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {
                countries.map((country) => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }
              </Select>
          </FormControl>
        </div>

        <div className="app__stats"> 
            <InfoBox isRed 
                     active = {caseType === "cases"}
                     onClick = {e => setCasesType('cases')} 
                     title = "Cases" cases = {prettyPrintStat(countryInfo.todayCases)} 
                     total = {prettyPrintStat(countryInfo.cases)} /> 
            <InfoBox active = {caseType === "recovered"}
                     onClick = {e => setCasesType('recovered')} 
                     title = "Recovered" cases = {prettyPrintStat(countryInfo.todayRecovered)} 
                     total = {prettyPrintStat(countryInfo.recovered)}/>   
            <InfoBox isRed
                     active = {caseType === "deaths"}
                     onClick = {e => setCasesType('deaths')} 
                     title = "Deaths" cases = {prettyPrintStat(countryInfo.todayDeaths)} 
                     total = {prettyPrintStat(countryInfo.deaths)}/>      
        </div>         
        
        <Map 
            casesType = {caseType}
            countries = {mapCountries}
            center = {mapCenter}
            zoom={mapZoom}
        />   
 
      </div>  
       
    <Card className = "app__right">
         <CardContent>
            <h3>Live Cases by country</h3>
            <Table countries = {tableData} />
            <h3 className = "app__title">Worldwide new {caseType}</h3>
            <LineGraph className = "app__graph" casesType = {caseType} />
         </CardContent>
      </Card>

    </div>
  );
}

export default App;
