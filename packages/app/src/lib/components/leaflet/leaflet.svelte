<script lang="ts">
	import type { GeoJSON, Layer, Map } from 'leaflet'
	import { browser } from '$app/environment'
	import { createEventDispatcher, onDestroy, onMount } from 'svelte'

	export const markerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 25 25"><path fill="currentColor" d="M12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7m0 2a5 5 0 0 0-5 5c0 1 0 3 5 9.71C17 12 17 10 17 9a5 5 0 0 0-5-5"/></svg>`
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

			const defaultIcon = new leaflet.DivIcon({
				html: markerSvg,
				className: 'custom-marker-icon',
				iconSize: [50, 50],
				iconAnchor: [25, 50],
				popupAnchor: [0, -25],
			})
			updateGeoJSON = () => {
				if (currentMarker && map) {
					map.removeLayer(currentMarker)
				}
				if (geoJSON && map) {
					currentMarker = leaflet
						.geoJSON(geoJSON, {
							pointToLayer: (feature, latlng) => {
								return leaflet.marker(latlng, { draggable: true, icon: defaultIcon })
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

					currentMarker = leaflet.marker(e.latlng, { draggable: true, icon: defaultIcon }).addTo(map)

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

			map.attributionControl.remove()
			map.scrollWheelZoom.disable()
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
	<div class={`border-2 border-black sm:h-[400px] ${$$restProps.class}`} bind:this={mapContainer}></div>
{/if}

<style>
	:global(.custom-marker-icon) {
		border: none;
	}
</style>
