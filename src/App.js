import React,{useState,useEffect} from 'react'
import './App.css'
import {FormControl,Select,MenuItem, Card, CardContent} from "@material-ui/core"
import InfoBox from './InfoBox';
import Table from './Table';
import { prettyPrintStat, sortData } from './utils';
import LineGraph from './LineGraph';
import Map from './Map';
import numeral from 'numeral';
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);

  const [country, setCountry] = useState("worldwide")
  
  const [countryInfo, setcountryInfo] = useState({});

  const [tableData, setTableData] = useState([]);

  const [mapCenter, setMapCenter] = useState({lat: 34.80746, lng: -40.4796});

  const [mapZoom, setMapZoom] = useState(3);

  const [mapCountries, setMapCountries] = useState([])

  const [casesType, setCasesType] = useState("cases")

  useEffect(() => {

    fetch("https://disease.sh/v3/covid-19/all")
    .then((response) => response.json())
    .then((data) => {
      setcountryInfo(data);
    })
  }, [])
  

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch ("https://disease.sh/v3/covid-19/countries")
      .then((response)=> response.json())
      .then((data)=> {
        const countries = data.map((country)=> (
          {
            name: country.country,
            value: country.countryInfo.iso2,

          })
        );
          const sortedData = sortData(data);
          setTableData(sortedData);
          setCountries(countries);
          setMapCountries(data);
      });
    };
    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
      const countryCode = event.target.value;
      setCountry(countryCode);
      const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' 
      : `https://disease.sh/v3/covid-19/countries/${countryCode}`
      
      await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        setcountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      })
  }
  
  return (
    <div className="app">
      <div className="app__left">
      <div className="app__header">
      <h1>Covid 19 Tracker </h1>
       <FormControl className="app__dropdown">
          <Select variant="outlined" onChange={onCountryChange} value={country} >
            <MenuItem value="worldwide"> Worldwide </MenuItem>
          {countries.map((country) =>(
            <MenuItem value={country.value}>{country.name}</MenuItem>
          ))
          }
          </Select>
        </FormControl>
        </div>

        <div className="app__stats">

          <InfoBox
          active={casesType === "cases"}
          onClick={(e) => setCasesType("cases")}
          title="Coronavirus Cases"
          isRed 
          cases={prettyPrintStat(countryInfo.todayCases)} 
          total={numeral(countryInfo.cases).format("0.0a")} />

          <InfoBox 
          active={casesType === "recovered"}
          onClick={(e) => setCasesType("recovered")}
          title="Recovered" 
          cases={prettyPrintStat(countryInfo.todayRecovered)} 
          total={numeral(countryInfo.recovered).format("0.0a")} />

          <InfoBox 
          active={casesType === "deaths"}
          onClick={(e) => setCasesType("deaths")}
          title="Deaths"
          isRed 
          cases={prettyPrintStat(countryInfo.todayDeaths)} 
          total={numeral(countryInfo.deaths).format("0.0a")}/>

        </div>

          <Map 
          casesType={casesType} 
          countries={mapCountries} 
          center={mapCenter} 
          zoom={mapZoom} 
          />

      </div>
      <Card className= "app__right">
          <CardContent>
            <h3>Live Cases By Country</h3>
            <Table countries={tableData}/>
            <h3 className='app__graphTitle'>Worldwide New {casesType} </h3>
            <LineGraph className="app__graph" casesType={casesType}/>
            
          </CardContent>
      </Card>
    </div>
  )
}

export default App