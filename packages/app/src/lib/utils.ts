import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { cubicOut } from 'svelte/easing'
import type { TransitionConfig } from 'svelte/transition'
import { error } from '@sveltejs/kit'
import { numSatsInBtc } from './constants'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

type FlyAndScaleParams = {
	y?: number
	x?: number
	start?: number
	duration?: number
}

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node)
	const transform = style.transform === 'none' ? '' : style.transform

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA
		const [minB, maxB] = scaleB

		const percentage = (valueA - minA) / (maxA - minA)
		const valueB = percentage * (maxB - minB) + minB

		return valueB
	}

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str
			return str + `${key}:${style[key]};`
		}, '')
	}

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0])
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0])
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1])

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			})
		},
		easing: cubicOut
	}
}

// TODO: This is not ideal, we should not face duplicate ids at any case
// And for 404, we should just throw error 404 as we do in other places
// so let's remove this
export const takeUniqueOrThrow = <T extends any[]>(values: T): T[number] => {
	if (!values.length) {
		error(404, 'Not found')
	}
	if (values.length !== 1) throw new Error('Found non unique or inexistent value')
	return values[0]!
}

export async function currencyToBtc(currency: string, amount: number, inSats?: boolean): Promise<number | null> {
	const apiUrl = `https://api.yadio.io/convert/${amount}/${currency}/btc`;
	try {
	  const response = await fetch(apiUrl);
	  const data = await response.json();
	  return inSats ?  bitcoinToSatoshis(data.result) : data.result;
	} catch (error) {
	  console.error(`Error converting ${amount} ${currency} to BTC: ${error}`);
	  return null;
	}
  }

export const bitcoinToSatoshis = (amountInBtc: string) => {
  const btc = parseFloat(amountInBtc);
  return Math.floor(btc * numSatsInBtc);
};