import auth from '../../api/service'

export default {
	name: 'home-page',

	data: function () {
		return {
            ops: {
                vBar: {
                    background: '#34495e',
                    opacity: 0.5,
                },
                vRail: {
                    background: '#34495e',
                    opacity: 0.2,
                },
            },
        }
	},

};
