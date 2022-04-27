import { useState,useMemo,useCallback,useRef,useEffect } from "react";
import{
    GoogleMap,
    Marker,
    DirectionsRenderer,
    Circle,
    MarkerClusterer,
    InfoWindow,
} from "@react-google-maps/api";
import axios from "axios";
import Distance from "./distance";
import React from "react";

type LatLngLiteral=google.maps.LatLngLiteral;
type DirectionsResult=google.maps.DirectionsResult;
type MapOptions=google.maps.MapOptions;
export default function Map(){
    const [didButtonClick,setDidButtonClick]= useState(false);
    const [userPositionlat, setUserPositionlat]= React.useState();
    const [userPositionlng, setUserPositionlng]= React.useState();
    const [directions,setDirections]= useState<DirectionsResult>();
    const mapRef= useRef<GoogleMap>();
    const [selectedParkSpot,setSelectedParkSpot]=useState(null);
    const [SelectedParkSpotLetfSide,setSelectedParkSpotLetfSide]=useState(null);
    const [selectedParkSpotid,setSelectedParkSpotid]=useState(null);
    const [SelectedParkSpotCapacity,setSelectedParkSpotCapacity]=useState(null);
    const [SelectedParkSpotDistanceToUser,setSelectedParkSpotDistanceToUser]=useState(null);
    const [SelectedParkSpotTraficJamToUser,setSelectedParkSpotTraficJamToUser]=useState(null);
    const [parksFromBackend,setparksFromBackend]= useState([]);

    const panTooo=React.useCallback(({lat,lng,didclick})=>{
      mapRef.current.panTo({ lat, lng });
      setUserPositionlat(lat);
      setUserPositionlng(lng);
      setDidButtonClick(didclick);
     

      
    },[]);
    const center = useMemo<LatLngLiteral>(
        () => ({ lat: 40.76, lng: 29.91 }),
        []
      );
      const options = useMemo<MapOptions>(
        () => ({  
            //mapId:"4443046534e0be29",  
          disableDefaultUI: true,
          clickableIcons: false,
        }),
        []
      );
      
      const onLoad= useCallback((map)=>(mapRef.current=map), []);// her seferinde haritayı izmite göre konumlandırıyor.

   

     
 
          useEffect(()=>{
                if(userPositionlat && userPositionlng)
                {
                  fetch(`http://127.0.0.1:8000/getparks/?lat=${userPositionlat}&lng=${userPositionlng}`)
                  .then(response => response.json()).then(data=>setparksFromBackend(data));
                  console.log(userPositionlat,userPositionlng);
                }
                },[userPositionlat,userPositionlng]);

       
            
        
      
      
      
     if(parksFromBackend){
      
       parksFromBackend.sort((b,a)=>Number(b["best"])-Number(a["best"]))
       console.log(parksFromBackend);
     }
      const fetchDirections =(park:LatLngLiteral)=>{
     
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
            <div className="controls" style={{overflowY:'auto'}}> 
                <h1>En İyi Öneriler</h1>
                
              {!didButtonClick && <p> Önerileri görebilmek için lütfen neredeyim butonuna basınız!</p>}
              {didButtonClick && parksFromBackend.map((park,index)=>
              
              <button key={index} className="leftButton" onClick={()=>{
                           setSelectedParkSpotLetfSide(park);
                           
                
                           
                           mapRef.current.panTo({lat: park["lat"],lng:park["lng"]})
              }} >
                           <p className="txt"> Park ID={index}</p>
                           <p> Bu parkın boş kapasitesi  {park["cap"]}/50</p>
                           <p>Bu park alanının size olan kuş bakışı uzaklığı={park["km"]}</p>
                           <p>Bu park alanının trafik yoğunluğu %{park["jam"]}</p>
                          
              </button>)
              }
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

                  <Locate panToo={panTooo} />
                 
                  <Marker position={{lat:userPositionlat,lng:userPositionlng}}
                  icon="https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png" />
                 
                 <MarkerClusterer>
                      {(clusterer): any => parksFromBackend.map((park,index)=>
                       <Marker
        
                         key={index}
                         position={{
                           lat:park["lat"],
                           lng:park["lng"],
                         }}
                         clusterer={clusterer}
                         onClick={()=>{
                           fetchDirections(park);
                           setSelectedParkSpot(park);
                           setSelectedParkSpotid(index);
                           setSelectedParkSpotCapacity(park["cap"]);
                           setSelectedParkSpotDistanceToUser(park["km"]);
                           setSelectedParkSpotTraficJamToUser(park["jam"]);
                         }}

                         />)}
                     </MarkerClusterer> 


                     {selectedParkSpot&&(
                       <InfoWindow 
                       position={selectedParkSpot}
                       onCloseClick={()=>{
                         setSelectedParkSpot(null)
                         setSelectedParkSpotid(null);
                         setSelectedParkSpotCapacity(null);
                         setSelectedParkSpotDistanceToUser(null);
                         setSelectedParkSpotTraficJamToUser(null);
                       }}
                       >
                         <div>
                           <h1> Bu park numarası {selectedParkSpotid}</h1>
                           <p> Bu parkın boş kapasitesi  {SelectedParkSpotCapacity}/50</p>
                           <p>Bu park alanının size olan kuş bakışı uzaklığı {SelectedParkSpotDistanceToUser}</p>
                           <p>Bu park alanının trafik yoğunluğu %{SelectedParkSpotTraficJamToUser}</p>
                         {directions && <Distance leg={directions.routes[0].legs[0]} />}
                         </div>
                       </InfoWindow>
                     )}
                  <Circle center ={{lat:userPositionlat,lng:userPositionlng}} radius={15000} options={closeOptions}/>
                  <Circle center ={{lat:userPositionlat,lng:userPositionlng}} radius={30000} options={middleOptions}/>
                  <Circle center ={{lat:userPositionlat,lng:userPositionlng}} radius={45000} options={farOptions}/>
                    
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



  function Locate({ panToo }) {
    
    return (
      <button
        className="locate"
        
        onClick={() => {
          navigator.geolocation.getCurrentPosition(
            (positionUser) => {
             
             
              panToo({
                lat: positionUser.coords.latitude,
                lng: positionUser.coords.longitude,
                didclick:true,
                
              });
              
            },
            () => null
          );
          
       }}
      >
        <img src="./button.png" alt="" />
      </button>
    );
  }