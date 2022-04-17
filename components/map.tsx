import { useState,useMemo,useCallback,useRef } from "react";
import{
    GoogleMap,
    Marker,
    DirectionsRenderer,
    Circle,
    MarkerClusterer,
} from "@react-google-maps/api";
import Places from "./places"
import axios from "axios"
import Distance from "./distance";
import React from "react";

type LatLngLiteral=google.maps.LatLngLiteral;
type DirectionsResult=google.maps.DirectionsResult;
type MapOptions=google.maps.MapOptions;
export default function Map(){
    const [office, setOffice]= useState<LatLngLiteral>();
    const [userPositionlat, setUserPositionlat]= React.useState();
    const [userPositionlng, setUserPositionlng]= React.useState();
    const [directions,setDirections]= useState<DirectionsResult>();
    const mapRef= useRef<GoogleMap>();


    /*const [firebaseMarker,setFirebaseMarker]= React.useState([]);*/

    const panToo=React.useCallback(({lat,lng})=>{
      mapRef.current.panTo({ lat, lng });
      setUserPositionlat(lat);
      setUserPositionlng(lng);
     

      
    },[]);
    const center = useMemo<LatLngLiteral>(
        () => ({ lat: 40.76, lng: 29.91 }),
        []
      );
      const options = useMemo<MapOptions>(
        () => ({  
            mapId:"4443046534e0be29",  
          disableDefaultUI: true,
          clickableIcons: false,
        }),
        []
      );

      const onLoad= useCallback((map)=>(mapRef.current=map), []);
      const parks=useMemo(()=>generateHouses(center),[center]);
      
      

      const fetchDirections =(park:LatLngLiteral)=>{
      //  if(!office) return;
        //  if(userPositionlat==null&&userPositionlng==null) return;
        const service= new google.maps.DirectionsService();
         service.route(
           {
             origin:park,
             destination:{lat:userPositionlat,lng:userPositionlng},
             travelMode:google.maps.TravelMode.DRIVING
           },
           (result,status)=>{
             if(status==="OK" && status){
               setDirections(result);
             }
           }
         )
      }
      
  return (
        <div className="container">
            <div className="controls"> 
                <h1>ARA</h1>
                <Places setOffice={(position)=>{
                    setOffice(position);
                    mapRef.current?.panTo(position);
                }} />
              {!office && <p> Lütfen adres seçiniz!!</p>}
              {directions && <Distance leg={directions.routes[0].legs[0]} />}
             </div>
          <div className="map">
              <GoogleMap zoom={10} center={center} onLoad={onLoad} mapContainerClassName="map-container" options={options}>
                 {
                   directions &&<DirectionsRenderer directions={directions} options={{
                     polylineOptions:{
                       zIndex:50,
                       strokeColor:"#1976d0",
                       strokeWeight:5,
                     }
                   }}/>
                 }

                  <Locate panToo={panToo} />
                 
                  <Marker position={{lat:userPositionlat,lng:userPositionlng}}
                  icon="https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png" />
                 
                   <MarkerClusterer>
                       {(clusterer)=>parks.map(park=>
                       <Marker 
                         key={park.lat}
                         position={park}
                         clusterer={clusterer}
                         onClick={()=>{
                           fetchDirections(park);
                         }}

                         />)}
                     </MarkerClusterer> 
                  <Circle center ={{lat:userPositionlat,lng:userPositionlng}} radius={15000} options={closeOptions}/>
                  <Circle center ={{lat:userPositionlat,lng:userPositionlng}} radius={30000} options={middleOptions}/>
                  <Circle center ={{lat:userPositionlat,lng:userPositionlng}} radius={45000} options={farOptions}/>
                     
                  {office && (
                  <>
                    < Marker position={office}
                     icon="https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png" />

                     <MarkerClusterer>
                       {(clusterer)=>parks.map(park=>
                       <Marker 
                         key={park.lat}
                         position={park}
                         clusterer={clusterer}
                         onClick={()=>{
                           fetchDirections(park);
                         }}

                         />)}
                     </MarkerClusterer> 
                   
                      <Circle center ={office} radius={15000} options={closeOptions}/>
                      <Circle center ={office} radius={30000} options={middleOptions}/>
                      <Circle center ={office} radius={45000} options={farOptions}/>
                  </>) }
              </GoogleMap>
          </div>
      </div>
  );
}

const defaultOptions={
    strokeOpacity:0.5,
    strokeWeight:2,
    clickable:false,
    draggaable:false,
    editable:false,
    visible:true,
};
const closeOptions={
    ...defaultOptions,
    zIndex:3,
    fillOpacity:0.05,
    strokeColor:"#8BC34A",
    fillColor:"#8BC34A",
};

const middleOptions={
    ...defaultOptions,
    zIndex:2,
    fillOpacity:0.05,
    strokeColor:"#FBC02D",
    fillColor:"#FBC02D",
};

const farOptions={
    ...defaultOptions,
    zIndex:1,
    fillOpacity:0.05,
    strokeColor:"#FF5252",
    fillColor:"#FF5252",
};

const generateHouses = (position: LatLngLiteral) => {

   
  const config = {
    headers:{"Access-Control-Allow-Origin": "*"},
    crossdomain: true 
  };

  axios.get('http://127.0.0.1:8000/getparks/?lat=30.0&lng=30.0',config)
  .then(function (response) {
    // handle success
    console.log(response);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .then(function () {
    // always executed
  });  
  
  const _houses: Array<LatLngLiteral> = [];
    for (let i = 0; i < 100; i++) {
      const direction = Math.random() < 0.5 ? -2 : 2;
      _houses.push({
        lat: position.lat + Math.random() / direction,
        lng: position.lng + Math.random() / direction,
      });
      
    }
    return _houses;
  };

  function Locate({ panToo }) {
    return (
      <button
        className="locate"
        onClick={() => {
          navigator.geolocation.getCurrentPosition(
            (positionUser) => {
             
              console.log(positionUser)
              panToo({
                lat: positionUser.coords.latitude,
                lng: positionUser.coords.longitude,
                
              });
            },
            () => null
          );
          
       }}
      >
        <img src="./locate.png" alt="" />
      </button>
    );
  }