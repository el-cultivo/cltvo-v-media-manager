import Vue from 'vue'
import VSelect from '../src/v-select.vue'

const myImportedComponent = (template) => Vue.extend({//en realidad lo impotaríamos así: import {myComponent} from '../vue/components/my-component'
	template,
	data() {
		return {
			my_prop: 'me llamo proppy'
		}
	},

	props: ['lastName']
})


xdescribe('sample-vue', () => {
	let vm = {}
	let componentTemplate = `<div></div>`//en un contexto  de uso real puede ser un id,  en un test muchas veces con pasar un div vacío nos basta
	let component;

	beforeEach(() => {//Configuración previa al test
		vm = new Vue({//creamos una instancia de Vue que nos sirva para el test
			replace:false,//no es necesario fuera del test, es sólo para cuando usamos el método mount sobre el body
			template: `
			<div>
				<my-component :last-name="last_name"></my-component>
			</div>`,//metemos nuestro componente en el template de la instancia e Vue.  Como se ve podemos pasar props
			mixins: [],
			// ready() {console.log(this.$children);},
			data: {
				last_name: 'the Prop'
			},
			components: {
				myComponent: myImportedComponent(componentTemplate)
			},
			methods: {//podemos mockear algunos metodos, ver el spyOn más abajo
				generalError: function(){},
				alertError: function() {},
				post: function(){},
			}
		}).$mount('body')//esto tambien es para el test

		component = vm.$children[0]//guardamos el child en la variable, para facilitar nuestro acceso a ella

		//asi terminamos de mockearlos
		spyOn(vm, 'generalError')
		spyOn(vm, 'alertError')
		spyOn(vm, 'post')
	}) 
	
	it('mi prop se llama proppy', function() {
		expect(component.my_prop).toEqual('me llamo proppy');
	});

	it('mi prop recibe la propiedad last_name', function() {
		expect(component.lastName).toEqual('the Prop');
	});

	//Ejemplo Importante!!!!!
	it('le cambio asincrónicamente el valor a proppy', function(done) {// para todo lo asíncrono, y en Vue hay mucho usamos done y Vue.nextTick
		component.my_prop = 'asyncProp'
		Vue.nextTick(()=> {
			expect(component.my_prop).toEqual('asyncProp');
			done()
		})
	});

});


