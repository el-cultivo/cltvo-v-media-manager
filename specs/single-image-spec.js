import Vue from 'vue'
import MediaManager from '../src/media-manager.vue'
import SingleImage from '../src/single-image.vue'
import {photos} from './media-manager/photos'

//faltan alertas de error bc46194

const tick = Vue.nextTick

describe('MediaManager', () => {
	const DummyComponent = Vue.extend({
		template: `<div></div>`,
		props:['photoableId', 'photoableType', 'use', 'class', 'order'],
		data() {
			return {
				component_name: 'Dummy',
				media: {}
			}
		},
		methods: {
			getName() {
				return this.component_name
			},

			associateMedia(media) {
				this.media = media
			},
			
			disassociateMedia(media_id) {
				if(media_id === this.media.id) {
					this.media = {}
				}
			},

			callMM() {
				this.$dispatch('callMediaManager', 'DummyComponent', this)
			},
			
			requestMediaDisassociation() {
				this.$dispatch('mediaDissasociationRequest', 'DummyComponent', this, this.media.id)
			}
		}
	})
	
	let vm = {}
	let MM = {}
	let SI ={}
	let SIwithImage ={}
	
	beforeEach(() => {//Configuración previa al test
		vm = new Vue({//creamos una instancia de Vue que nos sirva para el test
			replace:false,//no es necesario fuera del test, es sólo para cuando usamos el método mount sobre el body
			template: `
			<div id="main-vue">
			    <media-manager v-ref:media_manager></media-manager>
			    <single-image id="si1"></single-image>
			    <single-image id="si2" :current-image="{url: 'http://hola.mundo/img.jpg', id: 2}"></single-image>
			</div>`,//metemos nuestro componente en el template de la instancia e Vue.  Como se ve podemos pasar props
			mixins: [],
			// ready() {console.log(this.$children);},
			data: {
				store: {
					media_manager: {
						routes: {
							index: 'http://blaa.com/api/photos',
							single_image: 'http://blaa.com/api/photos/:id',
							create: 'http://blaa.com/api/photos',
							update: 'http://blaa.com/api/photos/:id',
							delete: 'http://blaa.com/api/photos/:id',
							associate: 'http://blaa.com/api/photos/:id/associate',
							disassociate: 'http://blaa.com/api/photos/:id/disassociate',
						}
					},
					photos: [],
					languages: [
						{
							iso6391: 'en',
							name: 'English'
						},
						{
							iso6391: 'es',
							name: 'Español'
						}
					],
					csrf_token: 'dameltoke'
				},
			},
			components: {
				MediaManager,
				SingleImage
			},
			methods: {//podemos mockear algunos metodos, ver el spyOn más abajo
				generalError: function(){},
				alertError: function() {},
				get: function(route, {success, error}){
					MM[success]({
						data: {
							photos:photos
						}
					})
				},
				post: function(){},
			},
			events: {
				callMediaManager(component_name, component) {
					this.$broadcast('callMediaManagerBroadcast', component_name, component)
				},
				
				mediaDissasociationRequest(component_name, component, media_id) {
					this.$broadcast('dissaociateMediaBroadcast', component_name, component, media_id)
				}
			}
		}).$mount('body')//esto tambien es para el test

		MM = vm.$children[0]//guardamos el child en la variable, para facilitar nuestro acceso a ella
		SI = vm.$children[1]//guardamos el child en la variable, para facilitar nuestro acceso a ella
		SIwithImage = vm.$children[2]//guardamos el child en la variable, para facilitar nuestro acceso a ella

		//asi terminamos de mockearlos
		spyOn(vm, 'generalError')
		spyOn(vm, 'alertError')
		spyOn(vm, 'post')
	}) 
	
	describe('Tiene un template', () => {
        it('tiene un template que existe en el DOM', () => {            
            expect(document.getElementsByClassName('.single-image')).not.toEqual(null)
        })
		it('puede tener un id', () => {
			expect(document.getElementById('si1')).not.toEqual(null)
		})
	})

    describe('Inicialización', () => {
        it('puede recibir una imagen desde el principio', (done) => {
            expect(SIwithImage.chosen_image.url).toEqual('http://hola.mundo/img.jpg')
            done()
        })
    })

    describe('Interacción con el Media Manager', () => {
        it('puede abrir el media manager', (done) => {
            SI.callMM()
            tick(() => {
                expect(MM.display).toEqual('block')
                done()
            })
        })
        it('puede recibir un imagen y otros metadatos desde el Media Manager y si la respuesta fue exitosa'/*ver 'Invocación por parte de un componente'*/, (done) => {
            SI.callMM()
            MM.chosen_image = photos[0]
            MM.onAssociateSuccess()
            tick(() => {
                expect(SI.chosen_image).toEqual(photos[0])
                done()
            })
        });
        it('escucha un evento para realizar una desasociación en favor de algún componente que ofrezaca la interfaz dissasociateMedia', (done) => {
            SI.associateMedia({ id: 1 })
            SI.requestMediaDisassociation()
            tick(() => {
                expect(MM.active_calling_component.component_name).toEqual(SI.component_name)
                expect(MM.disassociate_media_id).toEqual(SI.chosen_image.id)
                expect(vm.post).toHaveBeenCalledWith(document.getElementById('disassociate_photo_form'))
                MM.onDisassociateSuccess()
                tick(() => {
                    expect(SI.chosen_image).toEqual({})
                    done()
                })
            })
        })

    })
});


