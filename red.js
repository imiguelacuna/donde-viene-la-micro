let [lat, long] = args.plainTexts;
const baseUrl = 'https://appred.tstgo.cl/phone/v8/stopInfo?stopCode=STOPID&mode=3';
const paraderos = 'https://raw.githubusercontent.com/imiguelacuna/donde-viene-la-micro/main/stops.json';

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => 6371 * 2 * Math.atan2( Math.sqrt( Math.sin(deg2rad(lat2 - lat1) / 2) ** 2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(deg2rad(lon2 - lon1) / 2) ** 2 ), Math.sqrt( 1 - (Math.sin(deg2rad(lat2 - lat1) / 2) ** 2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(deg2rad(lon2 - lon1) / 2) ** 2) ) ) * 1000;
const deg2rad = (deg) => deg * (Math.PI / 180);

const buscarServicios = async (stopId) => {
	const url = baseUrl.replace('STOPID', stopId);
	let req = new Request(paraderos);
	req.headers = {
		'phone-id': 'shortcuts-apple'
	};
	const response = await req.loadJSON();
	return response;
}

let req = new Request(paraderos);

const response = await req.loadJSON();

const listadoParaderos = response
	.map((item) => ({
		stopId: item.stop_id,
		name: item.name,
		distance: Math.round(getDistanceFromLatLonInKm(lat, long, item.latitude, item.longitude)),
		routes: item.routes,
	}))
	.filter((item) => item.distance <= 100)
	.map((item) => {
		return {...item, servicios: buscarServicios(item.stopId)}
	});

// Ordenar las paradas por distancia de menor a mayor
listadoParaderos.sort((a, b) => a.distance - b.distance);

return listadoParaderos;