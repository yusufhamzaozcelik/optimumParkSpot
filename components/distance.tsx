const commutesPerYear = 260 * 2;
const litresPerKM = 10 / 100; //100 km de ortalama 10 litre benzin harcanır km başı ise 100 e bölünür
const gasLitreCost = 20;//benzin 20 tl desek
const litreCostKM = litresPerKM * gasLitreCost;
const secondsPerDay = 60 * 60 * 24;

type DistanceProps = {
  leg: google.maps.DirectionsLeg;
};

export default function Distance({ leg }: DistanceProps) {

  if(!leg.distance|| !leg.duration) return null;// bir şey yoksa hiç bir şey yapma
  const cost= Math.floor( 
    (leg.distance.value/1000)*litreCostKM
  )
  return( 
    <div>
      <p>
        Bu park yerinin seçilen yere uzaklığı <span className="highlight">{leg.distance.text}  </span>
       
      </p>
      <p>
        Seçili park yerine gitmek  <span className="highlight">{leg.duration.text}  </span> sürecektir.
      </p>
      <p>
        Seçili yere gitmek  <span className="highlight">{cost}  </span> TL yakıt ücreti gerekir.
      </p>

     
    </div>
  );
}