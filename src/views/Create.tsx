import Aside from "../components/Aside";
import Header from "../components/Header";

function Create() {
  return (
    <div>
      <Header />
      <div>
        <input type="text" placeholder="title" />
        <textarea name="" id="" placeholder="description"></textarea>
        <div>
          date
          <input type="date" name="" id="" />
          <input type="date" name="" id="" />
        </div>
        <div>
          sport
          <select name="" id="">
            <option value="">Tennis</option>
            <option value="">Padel</option>
            <option value="">PickleBall</option>
          </select>
        </div>
        <div>
          <input type="number" name="" id="" placeholder="price" />
        </div>
        <input type="text" name="" id="" placeholder="address" />
        <div>
          5 imagenes
          <input type="file" name="" id="" />
        </div>
        <input type="text" name="" id="" placeholder="Video Link" />
        <div>
          getaway details
          {/* mainDescription: string,
      amenities: [string, string, string], //limite de 5
      schedule: [ 
	{
  	"weekday": "string",
  	"startTime": "14:00",
  	"endTime": "15:00",
  	"location": string,
             “Activity”: string,
             }
      ],

      lodgingOptions: [  //limite de 3
	{
  	"name": "string",
	 “price”: “”,
             }
],
      optionalAddOns: [  //limite de 5
	{
  	"name": "string",
	 “price”: “”,
             }
      ],

      {
         "academyOptions": [ // importar opcion(es) de Academy
            {
  	"weekday": "Saturday",
  	"startTime": "14:00",
  	"endTime": "15:00",
  	"location": "Salitre",
  	"court": "4",
  	"trainer": ["Panche", "Orellana", "Fraser"],
  	"isIncluded": "true", // se debe incluir una opcion por defecto en el paquete
  	"price": "100", //precio por persona
	},
	 {
  	"weekday": "Saturday",
  	"startTime": "14:00",
  	"endTime": "15:00",
  	"location": "Salitre",
  	"court": "4",
  	"trainer": ["Panche", "Orellana", "Fraser"],
  	"isIncluded": "false", /
  	"price": "100", //precio por persona
	},

  ]},
  { */}
        </div>

        <div>tournament options</div>

        <div>ladders options</div>

        <div>policies and terms array 5 strings</div>
      </div>
    </div>
  );
}

export default Create;


// club dBlMgRVS3xLrb75ebFoN
// academy Oehr7aWlJTgWqZTU9ruo
// tournames f3c44c49-24c1-4c4b-9e97-2f3f90b91c7e
// ladders 8PY55sBY9Sxcyy4pKsX2