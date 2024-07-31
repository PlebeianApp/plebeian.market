export class TestError extends Error {
	constructor(
		message: string,
		public details: Record<string, unknown> = {},
	) {
		super(message)
		this.name = 'TestError'
	}
}

export function assertElementExists(element: unknown, message: string): asserts element {
	if (!element) {
		throw new TestError(message, { elementSelector: element })
	}
}
