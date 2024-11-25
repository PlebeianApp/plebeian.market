<script lang="ts">
	import type { GeoJSON, Layer, Map } from 'leaflet'
	import { browser } from '$app/environment'
	import { createEventDispatcher, onDestroy, onMount } from 'svelte'

	export const markerSvg = `<svg style="width:30px;height:30px" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>`
	let iconURL = 'data:image/svg+xml,' + encodeURIComponent(markerSvg)

	interface GeoJSONWithBoundingBox extends GeoJSON.Feature<GeoJSON.Point> {
		boundingbox: [number, number, number, number]
	}

	export let geoJSON: GeoJSONWithBoundingBox | null = null

	let mapContainer: HTMLDivElement
	let map: Map | undefined
	let currentMarker: Layer | null = null
	let updateGeoJSON: (() => void) | undefined

	let isDragging = false

	const dispatch = createEventDispatcher()

	onMount(async () => {
		if (browser) {
			const leaflet = await import('leaflet')
			await import('leaflet/dist/leaflet.css')

			leaflet.Icon.Default.mergeOptions({
				iconUrl: iconURL,
			})

			updateGeoJSON = () => {
				if (currentMarker && map) {
					map.removeLayer(currentMarker)
				}
				if (geoJSON && map) {
					currentMarker = leaflet
						.geoJSON(geoJSON, {
							pointToLayer: (feature, latlng) => {
								return leaflet.marker(latlng, { draggable: true })
							},
						})
						.addTo(map)

					map.flyToBounds(
						[
							[geoJSON.boundingbox[0], geoJSON.boundingbox[1]],
							[geoJSON.boundingbox[2], geoJSON.boundingbox[3]],
						],
						{ duration: 1 },
					)

					currentMarker.eachLayer((layer: Layer) => {
						layer.on('dragstart', () => {
							isDragging = true
						})

						layer.on('dragend', (event: { target: { getLatLng: () => { lat: number; lng: number } } }) => {
							const marker = event.target
							const position = marker.getLatLng()
							const bounds = map.getBounds()
							const boundingbox: [number, number, number, number] = [
								bounds.getSouth(),
								bounds.getNorth(),
								bounds.getWest(),
								bounds.getEast(),
							]

							dispatch('locationUpdated', {
								lat: position.lat,
								lon: position.lng,
								boundingbox: [...boundingbox],
								isDragged: isDragging,
							})
							isDragging = false
						})
					})
				}
			}

			map = leaflet.map(mapContainer).setView([0, 0], 2)

			map.on('click', (e) => {
				if (map) {
					const bounds = map.getBounds()
					const boundingbox: [number, number, number, number] = [bounds.getSouth(), bounds.getNorth(), bounds.getWest(), bounds.getEast()]

					if (currentMarker) {
						map.removeLayer(currentMarker)
					}

					currentMarker = leaflet.marker(e.latlng, { draggable: true }).addTo(map)

					dispatch('locationUpdated', {
						lat: e.latlng.lat,
						lon: e.latlng.lng,
						boundingbox,
						isDragged: true,
					})
				}
			})

			map.on('zoomend', () => {
				if (geoJSON && map) {
					const bounds = map.getBounds()
					const boundingbox: [number, number, number, number] = [bounds.getSouth(), bounds.getNorth(), bounds.getWest(), bounds.getEast()]

					dispatch('locationUpdated', {
						lat: geoJSON.geometry.coordinates[1],
						lon: geoJSON.geometry.coordinates[0],
						boundingbox,
						isDragged: true,
					})
				}
			})

			leaflet
				.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				})
				.addTo(map)

			if (geoJSON) {
				updateGeoJSON()
			}
		}
	})

	$: if (browser && map && geoJSON && updateGeoJSON) {
		updateGeoJSON()
	}

	onDestroy(() => {
		if (browser && map) {
			map.remove()
		}
	})
</script>

{#if browser}
	<main>
		<div class="border-2 border-black" bind:this={mapContainer}></div>
	</main>
{/if}

<style>
	div {
		height: 300px;
		width: 100%;
		z-index: 0;
	}
</style>
