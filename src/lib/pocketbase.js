import PocketBase from 'pocketbase'

const PROD_URL = 'https://api.bricefrisco.com'
const DEV_URL = 'http://127.0.0.1:8090'

const baseUrl = import.meta.env.VITE_POCKETBASE_URL || (import.meta.env.PROD ? PROD_URL : DEV_URL)

const pb = new PocketBase(baseUrl)

export default pb

