<script>
	import Footer from '$lib/components/footer.svelte'
	import Header from '$lib/components/header.svelte'

	import '../app.css'
</script>

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
<link
	href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
	rel="stylesheet"
/>
<Header />
<slot />
<Footer />
