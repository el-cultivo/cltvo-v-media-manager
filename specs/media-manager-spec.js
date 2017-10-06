import Vue from 'vue'

const myImportedComponent = (template) => Vue.extend({//en realidad lo impotaríamos así: import {myComponent} from '../vue/components/my-component'
	template,
	data() {
		return {
			my_prop: 'me llamo proppy'
		}
	},

	props: ['lastName']
})


fdescribe('MediaManager', () => {
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
	
	describe('Display', () => {
		xit('puede ser abierto', function() {});
		xit('puede ser cerrado', function() {});
	})	

	describe('[GET] Trae Medias', ()=> {
		xit('puede hacer una petición GET ajax para traer imágenes', function() {});
		xit('puede mostrar las imágens una vez que existan en ???', function() {});
	})

	describe('[POST] Crea una media', () => {
		xit('puede hacer una petición POST ajax para crear una imagen', function() {});
		xit('puede agregar la imagen a la lista de imágenes', function() {});
		xit('puede mostrar un error si la peticion no fue exitosa', function() {});
	})

	describe('[PATCH] Edita propiedades de la media', () => {
		xit('puede hacer una petición PATCH ajax para editar los contenidos de una imagen', function() {});
		xit('puede actualizar la imagen si la petición fue exitosa', function() {});
		xit('puede mostrar un error si la peticion no fue exitosa', function() {});
	})

	describe('[DELETE] Eliminación de medias', ()=> {
		xit('puede hacer una petición DELETE ajax para eliminar una imagen', function() {});
		xit('puede actualizar las imágenes que se muestran si se elimina exitosamente la imagen', function() {});
		xit('puede mostrar un error si la peticion no fue exitosa', function() {});
	})

	describe('Interacción con otros componentes', ()=>{
		describe('Invocación por parte de un componente', () => {
			xit('puede ser abierto por un componente', function() {});
			xit('puede recibir una referencia al componente que lo invoca (el "this" del componente)', function() {});
			xit('puede eliminar esta referencia una vez que se cierra', function() {});
		})
		describe('[POST] Asociación de medias', () => {
			xit('puede hacer una petición a nombre de SingleImage y Gallery para asociar una imágen a un recurso (página, post, etc.)', function() {});
			xit('puede mandar la imagen y otros metadatos al SingleImage o a Gallery si la respuesta fue exitosa (esto invocando un método callback propio del componente que llamó al Media Manager)'/*ver 'Invocación por parte de un componente'*/, function() {});
			xit('puede mostrar un error si la peticion no fue exitosa', function() {});			
		})	
	})

	describe('Orden y Filtros', () => {
		xit('puede ordenar fotos por fecha', function() {});
		xit('puede filtrar fotos por título', function() {});
	})

	it('mi prop recibe la propiedad last_name', function() {
		expect(component.lastName).toEqual('the Prop');
	});
});


