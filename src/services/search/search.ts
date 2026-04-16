import api from "../../api/api";


interface LocationI {
    lat: string;
    lng: string;
    min: string;
    max: string;
}
export const seachnearby = async(locations: LocationI)=>{
    try {
        const { data } = await api.get("/search/nearby", {
            params: locations,
        });

        return data;
    } catch (error: any) {
        console.error('error in searchNearby')
        throw new Error(error)
    }
}

export const seachFilter = async() => {}

export const autocomplete = async() => {}

export const searchNearbyOffers = async() => {}