// note that Auth is top-level, whereas the API stuff is not
const awsmobile = {
	Auth: {
		region: 'us-east-1',
		userPoolId: 'your-region_YOUR_REGION_ID',
		userPoolWebClientId: '6vstsuciYOURCLIENTID',
		identityPoolId: 'identitypoolID',
		
	},
	Storage: {
		AWSS3: {
			bucket: 'amplifynextjschatappe467b698899b41e3b4b88ef2124f7550-dev',
			region: 'us-east-1',
		},
	},
	aws_project_region: 'us-east-1',
	aws_appsync_graphqlEndpoint:
		'https://pichgts56zaqxinnfqrashfxrm.appsync-api.us-east-1.amazonaws.com/graphql',
	aws_appsync_region: 'us-east-1',
	aws_appsync_apiKey: 'da2-kobb3snqf5aenliuqprnalqlqa',
	aws_appsync_authenticationType: 'API_KEY',
}

export default awsmobile
