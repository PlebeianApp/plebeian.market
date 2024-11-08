<script lang="ts">
	export let size = 25
	export let color = 'currentColor'

	const sizeFormatted = `${size}px`
</script>

<div class="spinner" style={`width: ${sizeFormatted}; height: ${sizeFormatted}; --spinner-color: ${color};`}>
	<div class="double-bounce1"></div>
	<div class="double-bounce2"></div>
</div>

<style>
	.spinner {
		position: relative;
		padding: 2px;
	}

	.double-bounce1,
	.double-bounce2 {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background-color: var(--spinner-color);
		opacity: 0.6;
		position: absolute;
		top: 0;
		left: 0;

		-webkit-animation: sk-bounce 2s infinite ease-in-out;
		animation: sk-bounce 2s infinite ease-in-out;
	}

	.double-bounce2 {
		-webkit-animation-delay: -1s;
		animation-delay: -1s;
	}

	@-webkit-keyframes sk-bounce {
		0%,
		100% {
			-webkit-transform: scale(0);
		}
		50% {
			-webkit-transform: scale(1);
		}
	}

	@keyframes sk-bounce {
		0%,
		100% {
			transform: scale(0);
			-webkit-transform: scale(0);
		}
		50% {
			transform: scale(1);
			-webkit-transform: scale(1);
		}
	}
</style>
