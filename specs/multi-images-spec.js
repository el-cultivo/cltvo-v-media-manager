import Vue from 'vue'
import MediaManager from '../src/media-manager.vue'
import MultiImages from '../src/multi-images.vue'
import {photos} from './media-manager/photos'

//faltan alertas de error bc46194

const tick = Vue.nextTick

describe('MultiImages', () => {
	
	let vm = {}
	let MM = {}
	let MI ={}
	let MIwithImages ={}
	
	beforeEach(() => {//Configuración previa al test
		vm = new Vue({//creamos una instancia de Vue que nos sirva para el test
			replace:false,//no es necesario fuera del test, es sólo para cuando usamos el método mount sobre el body
			template: `
			<div id="main-vue">
			    <media-manager v-ref:media_manager></media-manager>
			    <multi-images id="mi1"></multi-images>
			    <multi-images id="mi2" :all-photos="store.photos.slice(0, 3)"></multi-images>
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
					photos: photos,
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
				MultiImages
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

        // console.log(vm.store.photos)
        
		MM = vm.$children[0]//guardamos el child en la variable, para facilitar nuestro acceso a ella
		MI = vm.$children[1]//guardamos el child en la variable, para facilitar nuestro acceso a ella
		MIwithImages = vm.$children[2]//guardamos el child en la variable, para facilitar nuestro acceso a ella

		//asi terminamos de mockearlos
		spyOn(vm, 'generalError')
		spyOn(vm, 'alertError')
		spyOn(vm, 'post')
	}) 
	
	describe('Tiene un template', () => {
        it('tiene un template que existe en el DOM', () => {            
            expect(document.getElementsByClassName('.multi-images')).not.toEqual(null)
        })
		it('puede tener un id', () => {
			expect(document.getElementById('mi1')).not.toEqual(null)
		})
        it('puede imprimir las imágenes que se le pasan', (done) => {
			tick(() => {
				expect($('.multi-images__img').length).toEqual(3)
				done()
			})
        })
		it('puede imprimir las imágenes que se le asocian', (done) => {
			MIwithImages.associateMedia(vm.store.photos[3])
			MIwithImages.associateMedia(vm.store.photos[4])
			tick(() => {
				expect($('#mi2 .multi-images__img').length).toEqual(5)
				done()
			})
		})
		it('puede desimprimir las imágenes que se le desasocian', (done) => {
			tick(() => {
				MIwithImages.requestMediaDisassociation(1)
				MM.onDisassociateSuccess()
				tick(() => {
					expect($('#mi2 .multi-images__img').length).toEqual(2)
					done()
				})
			})
		})
	})

    describe('Inicialización', () => {
        it('puede recibir una imagen desde el principio', (done) => {
            expect(MI.chosen_images[0]).toEqual(undefined)
            expect(MIwithImages.chosen_images[0].url).toEqual('http://mm.dev/storage/images/0.png')
            expect(MIwithImages.chosen_images.length).toEqual(3)
            done()
        })
    })

    describe('Interacción con el Media Manager', () => {
        it('puede abrir el media manager', (done) => {
            MI.callMM()
            tick(() => {
                expect(MM.display).toEqual('block')
                done()
            })
        })
        it('puede recibir un imagen y otros metadatos desde el Media Manager y si la respuesta fue exitosa'/*ver 'Invocación por parte de un componente'*/, (done) => {
            MI.callMM()
            MM.chosen_image = photos[0]
            MM.onAssociateSuccess()
            tick(() => {
                expect(MI.chosen_images[0]).toEqual(photos[0])
                done()
            })
        });
        it('escucha un evento para realizar una desasociación en favor de algún componente que ofrezaca la interfaz dissasociateMedia', (done) => {
            MI.associateMedia({ id: 1 })
            MI.associateMedia({ id: 2 })
            MI.requestMediaDisassociation(2)
            tick(() => {
                expect(MM.active_calling_component.component_name).toEqual(MI.component_name)
                expect(vm.post).toHaveBeenCalledWith(document.getElementById('disassociate_photo_form'))
                MM.onDisassociateSuccess()
                tick(() => {
                    expect(MI.chosen_images).toEqual([{ id: 1 }])
                    done()
                })
            })
        })
    })
	describe('Sort', () => {
		it('puede cambiar el orden de las imágenes', (done) => {
			let initial_order_of_ids = MIwithImages.chosen_images.map(img => img.id)
			MIwithImages.onSortUpdate({oldIndex: 0, newIndex: 1})
			tick(() => {
				let final_order_of_ids = MIwithImages.chosen_images.map(img => img.id)
				expect(initial_order_of_ids).not.toEqual(final_order_of_ids)
				expect(final_order_of_ids).toEqual([1, 0, 2])
				done()
			})
		})
		it('puede obtener el órden de los ids de las imágenes', (done) => {
			expect(MIwithImages.orderedIds).toEqual([0,1,2])
			MIwithImages.onSortUpdate({ oldIndex: 0, newIndex: 1 })
			tick(() => {
				expect(MIwithImages.orderedIds).toEqual([1,0,2])
				done()
			})
		})
	})
});


