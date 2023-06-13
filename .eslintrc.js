module.exports = {
	env: {
		es2022: true,
		node: true,
	},
	extends: 'eslint:recommended',
	settings: {
		'import/resolver': {
			'babel-module': {},
		},
	},
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	}
}


