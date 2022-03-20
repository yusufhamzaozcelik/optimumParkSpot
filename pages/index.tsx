import { useLoadScript } from '@react-google-maps/api'
import Map from "../components/map";

export default function Home() {

  const {isLoaded} = useLoadScript({
    googleMapsApiKey:"AIzaSyD_xlzyE3oR-b-Sx1Uyz8Fz5ovjVAxG2BE",
    libraries:["places"],
  });

  if(!isLoaded) return<div>Loading...</div>;
  return <Map />;
    
  
}
