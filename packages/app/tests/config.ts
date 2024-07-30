import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

export const config = {
	appHost: process.env.APP_HOST || 'localhost',
	appPort: process.env.APP_PORT || '5173',
	testUserPrivateKey: process.env.TEST_USER_PRIVATE_KEY || 'ee40a2dc441238f241d1728af9507147e9b5ed18c1c61d84876d4f2502c044b3',
	testUserPassword: process.env.TEST_USER_PASSWORD || '123',
	baseUrl: `http://${process.env.APP_HOST || 'localhost'}:${process.env.APP_PORT || '5173'}`,
}
