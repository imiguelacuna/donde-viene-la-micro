let [lat, long] = args.plainTexts;
const baseUrl = 'https://appred.tstgo.cl/phone/v8/stopInfo?stopCode=STOPID&mode=3';
const paraderos = 'https://raw.githubusercontent.com/imiguelacuna/donde-viene-la-micro/main/stops.json';

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => 6371 * 2 * Math.atan2( Math.sqrt( Math.sin(deg2rad(lat2 - lat1) / 2) ** 2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(deg2rad(lon2 - lon1) / 2) ** 2 ), Math.sqrt( 1 - (Math.sin(deg2rad(lat2 - lat1) / 2) ** 2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(deg2rad(lon2 - lon1) / 2) ** 2) ) ) * 1000;
const deg2rad = (deg) => deg * (Math.PI / 180);

const buscarServicios = async (stopId) => {
	const url = baseUrl.replace('STOPID', stopId);
	let req = new Request(url);
	req.headers = {
		"phone-id": "123456789",
	}
	const response = await req.loadJSON();

	return response?.predictions?.map(x => {
		return {
			route: x?.route,
			distanceLabel: x?.distanceLabel,
			timeLabel: x?.timeLabel,
			distance: x?.distance,
			licensePlate: x?.licensePlate,
		}
	}) || [];
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
	.filter((item) => item.distance <= 100);

for(let i = 0; i < listadoParaderos.length; i++) {
	const paradero = listadoParaderos[i];
	const servicios = await buscarServicios(paradero.stopId);
	paradero.servicios = servicios;
}

// Ordenar las paradas por distancia de menor a mayor
listadoParaderos.sort((a, b) => a.distance - b.distance);
 
const menu = listadoParaderos.reduce((acc, curr)=> { 
	acc[curr.stopId] = curr.name;
	return acc;
}, {});

const servicios = listadoParaderos.reduce((acc, curr) => {
	acc[curr.stopId] = curr.servicios.reduce((acc, curr) => {
		acc[curr.route] = [...(acc[curr.route] || []), `${curr.distanceLabel} - ${curr.timeLabel} | ${curr.licensePlate}`];
		return acc;
	}, {})
	return acc;
}, {});

return { menu, servicios };