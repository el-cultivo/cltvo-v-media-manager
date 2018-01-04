import Vue from 'vue'
import MediaManager from '../src/media-manager.vue'
import {photos} from './media-manager/photos'

const tick = Vue.nextTick

fdescribe('MediaManager', () => {
	const DummyComponent = Vue.extend({
		template: `<div></div>`,
		props:['photoableId', 'photoableType', 'use', 'class', 'order'],
		data() {
			return {
				component_name: 'Dummy',
				media: {},
				ordered_ids: [1,2,3]
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
			},

			requestPhotosSorting() {
				this.$dispatch('photosSortingRequest', 'DummyComponent', this, this.ordered_ids)
			}
		}
	})
	
	let vm = {}
	let MM = {}
	let DummyMediaComponent ={}
	
	beforeEach(() => {//Configuración previa al test
		vm = new Vue({//creamos una instancia de Vue que nos sirva para el test
			replace:false,//no es necesario fuera del test, es sólo para cuando usamos el método mount sobre el body
			template: `
			<div id="main-vue">
			<media-manager v-ref:media_manager></media-manager>
			<dummy-component v-ref:dummy
				photoable-id="24"
				photoable-type="dummy-type"
				use="dummyuse"
				class="some-class"
				:order="'null'"
			></dummy-component>
			</div>`,//metemos nuestro componente en el template de la instancia e Vue.  Como se ve podemos pasar props
			mixins: [],
			// ready() {console.log(this.$children);},
			data: {
				store: {
					media_manager: {
						routes: {
							index: 'http://blaa.com/api/photos',
							sort_photos: 'http://blaa.com/api/photos/sort',
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
				DummyComponent
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
				},
				photosSortingRequest(component_name, component, ordered_ids) {
					this.$broadcast('sortPhotosBroadcast', component_name, component, ordered_ids)
				},
				
			}
		}).$mount('body')//esto tambien es para el test

		MM = vm.$children[0]//guardamos el child en la variable, para facilitar nuestro acceso a ella
		DummyMediaComponent = vm.$children[1]//guardamos el child en la variable, para facilitar nuestro acceso a ella

		//asi terminamos de mockearlos
		spyOn(vm, 'generalError')
		spyOn(vm, 'alertError')
		spyOn(vm, 'post')
	}) 
	
	describe('Tiene un template', () => {
		it('tiene un template que existe en el DOM', () => {
			expect(document.getElementById('media-manager')).not.toEqual(null)
		})
		it('el template esta en un inicio oculto', () => {
			expect(document.getElementById('media-manager').style.display).toEqual('none')
		})
	})

	describe('Display', () => {
		it('puede ser abierto', (done) => {
			MM.open()
			tick(() => {
				expect(document.getElementById('media-manager').style.display).toEqual('block')
				done()
			})
		});
		it('puede ser cerrado', (done) => {
			MM.open()
			tick(() => {
				MM.close()
				tick(() => {
					expect(document.getElementById('media-manager').style.display).toEqual('none')
					done()
				})
			})
		});
	})	
	describe('Languages', () => {
		it('recibe los lenguajes desde el store', () => {
			expect(MM.store.languages).toEqual(vm.store.languages)
		})
	})
	
	describe('[GET] Trae Medias', ()=> {
		it('puede hacer una petición GET ajax para traer imágenes', (done) => {
			MM.getPhotos()
			tick(()=> {
				expect(MM.photos).toEqual(photos)
				done()
			})
		})

		it('puede, al ser abierto, hacer un request GET ajax para traer las imágenes', (done) => {
			MM.open()
			tick(()=> {
				expect(MM.photos).toEqual(photos)
				done()
			})
		})
		
		it('puede mostrar las imágenes una vez que existan en this.$root.store.photos', (done) => {
			MM.open()
			tick(() =>{
				let images = $('.media-manager__image')
				
				let urls = images.map((i, el) => $(el).css('background-image').replace('url(', '').replace(')', '').replace(/\"/g, '')).toArray()
				
				expect(images.length).toEqual(MM.photos.length)
				
				expect(urls).toEqual(photos.map(p=>p.thumbnail_url))
				
				done()
			})		
		})
		
		it('puede mandar un error si la petición falla', (done) => {
			vm.get = function(route, {success, error}){	
				MM[error]({message: ['errores']})
			}
			MM.getPhotos()
			tick(()=> {
				expect(vm.alertError).toHaveBeenCalledWith({message: ['errores']})
				done()
			})
		})
	})
	
	describe('[Imágenes]', () => {
		it('puede ordenar las imágenes por más recientes y más antiguas', (done) => {
			let oldPhoto = {"updated_at": "1999-09-22 15:30:01"}
			let newPhoto = {"updated_at": "2099-09-22 15:30:01"}
			MM.getPhotos()
			MM.sort_by = 'desc'
			tick(() => {
				expect(MM.filterableAndSortablePhotos[MM.filterableAndSortablePhotos.length - 1]).toEqual(photos[0])
				MM.sort_by = 'asc'
				
				tick(() => {
					expect(MM.filterableAndSortablePhotos[MM.filterableAndSortablePhotos.length - 1]).toEqual(photos[photos.length - 1])
					
					MM.sort_by = 'asc'
					MM.photos.push(oldPhoto)
					MM.photos.push(newPhoto)
					
					tick(() => {
						expect(MM.filterableAndSortablePhotos[0]).toEqual(oldPhoto)
						done()
					})
				})
			})
		})
		
		it('puede filtar imágenes por la propiedad `title`', (done) => {
			MM.getPhotos()
			MM.search = "5"
			tick(() => {
				expect(MM.filterableAndSortablePhotos.length).toEqual(1)
				expect(MM.filterableAndSortablePhotos[0].title).toEqual("Title 5")
				
				MM.search = "0"
				tick(() => {
					expect(MM.filterableAndSortablePhotos.length).toEqual(2)
					expect(MM.filterableAndSortablePhotos[0].title).toEqual("Title 10")
					expect(MM.filterableAndSortablePhotos[1].title).toEqual("Title 0")
					done()
				})
			})
		})
		
		it('puede combinar filtrado y ordenado', (done) => {
			MM.getPhotos()
			MM.search = "0"
			tick(() => {
				expect(MM.filterableAndSortablePhotos.length).toEqual(2)
				expect(MM.filterableAndSortablePhotos[0].title).toEqual("Title 10")
				expect(MM.filterableAndSortablePhotos[1].title).toEqual("Title 0")
				
				MM.sort_by = 'asc'
				tick(() => {
					expect(MM.filterableAndSortablePhotos[0].title).toEqual("Title 0")					
					expect(MM.filterableAndSortablePhotos[1].title).toEqual("Title 10")
					done()
				})
			})
		})
	})
	
	
	describe('[POST] Crea una media', () => {
		it('puede hacer una petición POST ajax para crear una imagen', (done) => {
			spyOn(MM, 'post')
			spyOn(MM, 'makePost')
			MM.post(document.getElementById('create_photo_form'))
			MM.makePost('create_photo_form')
			expect($('#create_photo_form').length).toEqual(1)
			expect(MM.post).toHaveBeenCalledWith(document.getElementById('create_photo_form'))
			expect(MM.makePost).toHaveBeenCalledWith('create_photo_form')
			done()
		})
		it('puede agregar la imagen a la lista de imágenes', (done) => {
			//asumimos que se $root usando el módulo crudAjax para hacer los posts, en ese caso, puesto que la forma se llama create_photo_form, el callback se llamará onCreateSuccess
			MM.onCreateSuccess({data:photos[0]}, document.getElementById('create_photo_form'))
			tick(()=> {
				expect(MM.photos).toEqual([photos[0]])
				done()
			})
		});

		xit('puede mostrar un error si la peticion no fue exitosa', (done) => {});
	})

	describe('[Selection] Puede seleccionar una imagen para editar o mandar a un hijo', () => {
		
		it('al dar click sobre una imagen se hace un query al servidor trayedo la imagen solicitada', (done) => {
			let id = 1
			spyOn(MM, 'getChosenImage')
			MM.chooseImage(id)
			tick(() => {
				expect(MM.getChosenImage).toHaveBeenCalledWith('http://blaa.com/api/photos/1')
				done()
			})
		})

		it('selecciona una imagen y muestra sus datos en los campos de edición', (done) => {
			MM.onGetChosenImageDataSuccess(photos[0])
			tick(() => {
				expect(MM.chosen_image).toEqual(photos[0])
				
				expect($('.update_title_input').toArray()
						.map(i => [i.value, i.name]))
				.toEqual([ 
					['en_Title 0', 'title[en]'], 
					['es_Title 0', 'title[es]'] ]
				)

				expect($('.update_alt_input').toArray()
					.map(i => [i.value, i.name]))
				.toEqual([ 
					['en_Alt 0', 'alt[en]'], 
					['es_Alt 0', 'alt[es]'] ]
				)

				expect($('.update_description_input').toArray()
				.map(i => [i.value, i.name]))
				.toEqual([ 
					['en_Description 0', 'description[en]'], 
					['es_Description 0', 'description[es]'] ]
				)
				
				done()
			})
		}) 
	})
	
	describe('[PATCH] Edita propiedades de la media', () => {
		it('genera los inputs correctos dependiendo de la cantidad de lenguages que haya en el store', done => {
			tick(() => {
				expect($('.update_title_input').length).toEqual(2)
				expect($('.update_title_input').toArray().map(i => i.name)).toEqual([ 'title[en]', 'title[es]' ])
				done()

			})
		})
		it('puede hacer una petición PATCH ajax para editar los contenidos de una imagen', (done) => {
			spyOn(MM, 'post')
			MM.post(document.getElementById('update_photo_form'))
			expect($('#update_photo_form').length).toEqual(1)
			expect(MM.post).toHaveBeenCalledWith(document.getElementById('update_photo_form'))
			done()
		});
		it('al seleccionar una imagen, forma la ruta correcta del action de la forma', (done) => {
			MM.chosen_image = {id:1}
			tick(() => {
				expect(document.getElementById('update_photo_form').action).toEqual('http://blaa.com/api/photos/1')
				MM.chosen_image = {id:12}
				tick(() => {
					expect(document.getElementById('update_photo_form').action).toEqual('http://blaa.com/api/photos/12')
					done()
				})
			})
		});
		xit('muestra mensaje de exito la petición fue aceptada', (done) => {});
		xit('puede mostrar un error si la peticion no fue exitosa', (done) => {});
	})

	describe('[DELETE] Eliminación de medias', ()=> {
		it('puede hacer una petición DELETE ajax para eliminar una imagen', (done) => {
			spyOn(MM, 'post')
			MM.post(document.getElementById('delete_photo_form'))
			expect($('#delete_photo_form').length).toEqual(1)
			expect(MM.post).toHaveBeenCalledWith(document.getElementById('delete_photo_form'))
			done()
		});
		it('al seleccionar una imagen, forma la ruta correcta del action de la forma', (done) => {
			MM.chosen_image = {id:1}
			tick(() => {
				expect(document.getElementById('delete_photo_form').action).toEqual('http://blaa.com/api/photos/1')
				MM.chosen_image = {id:12}
				tick(() => {
					expect(document.getElementById('delete_photo_form').action).toEqual('http://blaa.com/api/photos/12')
					done()
				})
			})
		});
		xit('puede actualizar las imágenes que se muestran si se elimina exitosamente la imagen', (done) => {});
		xit('puede mostrar un error si la peticion no fue exitosa', (done) => {});
	})

	describe('[Forms]', () => {
		it('mandan los campos _method y _token correctos', () => {
			let all_forms = $('form')

			tick(() => {
				let tokens = all_forms
					.map((i, f)=> $(f).find('[name="_token"]').val())
					.toArray()
					.reduce((a, b) =>  a === b ? a : 'error', 'dameltoke')

				expect(all_forms.length).toEqual(6)
				expect(tokens).toEqual('dameltoke')

				expect($('#update_photo_form').find('[name="_method"]').val()).toEqual('PATCH')
				expect($('#delete_photo_form').find('[name="_method"]').val()).toEqual('DELETE')
				expect($('#disassociate_photo_form').find('[name="_method"]').val()).toEqual('DELETE')
			})
		})
	})

	describe('Interacción con otros componentes', ()=>{
		describe('Invocación por parte de un componente', () => {
			it('puede ser abierto por un componente', (done) => {
				DummyMediaComponent.callMM()
				tick(() => {
					expect(MM.display).toEqual('block')
					done()
				})
			});
			it('puede recibir una referencia al componente que lo invoca (el "this" del componente)', (done) => {
				DummyMediaComponent.callMM()
				tick(() => {
					expect(MM.active_calling_component.component_name).toEqual(DummyMediaComponent.component_name)// no corremos un test de igualdad del objeto, porque karma crashea
					done()
				})
			});
			it('puede eliminar esta referencia una vez que se cierra', (done) => {
				DummyMediaComponent.callMM()
				tick(() => {
					expect(MM.active_calling_component.component_name).toEqual(DummyMediaComponent.component_name)// no corremos un test de igualdad del objeto, porque karma crashea
					MM.close()
					tick(() => {
						expect(MM.active_calling_component).toEqual({})
						done()
					})
				})
			});
		})
		describe('[POST] Asociación de medias', () => {
			it('puede hacer una petición a nombre de SingleImage y Gallery para asociar una imágen a un recurso (página, post, etc.)', (done) => {
				MM.chosen_image = {id: 2}
				DummyMediaComponent.callMM()
				tick(() => {
					let form = $('#associate_photo_form')
					expect(form[0].action).toEqual('http://blaa.com/api/photos/2/associate')
					
					let photoableId = form.find('[name="photoable_id"]').val()
					expect(photoableId).toEqual('24')
					
					let photoableType = form.find('[name="photoable_type"]').val()
					expect(photoableType).toEqual('dummy-type')
					
					let use = form.find('[name="use"]').val()
					expect(use).toEqual('dummyuse')
					
					let class_ = form.find('[name="class"]').val()
					expect(class_).toEqual('some-class')
					
					let order = form.find('[name="order"]').val()
					expect(order).toEqual('null')
					
					MM.close() 
					tick(() => {
						let photoableId = form.find('[name="photoable_id"]').val()
						expect(photoableId).toEqual('')
						
						let photoableType = form.find('[name="photoable_type"]').val()
						expect(photoableType).toEqual('')
						
						let use = form.find('[name="use"]').val()
						expect(use).toEqual('')
						
						let class_ = form.find('[name="class"]').val()
						expect(class_).toEqual('')
						
						let order = form.find('[name="order"]').val()
						expect(order).toEqual('')							
						
						done()
					})				
				})
			});
			it('puede mandar la imagen y otros metadatos al SingleImage o a Gallery si la respuesta fue exitosa (esto invocando un método callback propio del componente que llamó al Media Manager)'/*ver 'Invocación por parte de un componente'*/, (done) => {
				DummyMediaComponent.callMM()
				MM.chosen_image = photos[0]
				MM.onAssociateSuccess()
				tick(() => {
					expect(DummyMediaComponent.media).toEqual(photos[0])
					done()
				})
			});
			it('cierra al MediaManager después de una petición exitosa', (done) => {
				DummyMediaComponent.callMM()
				MM.chosen_image = photos[0]
				MM.onAssociateSuccess()
				tick(() => {
					expect(MM.display).toEqual('none')
					done()
				})
			});			
			xit('puede mostrar un error si la peticion no fue exitosa', (done) => {});			
		})	
		
		describe('[DELETE] Desasociación de medias', () => {
			it('escucha un evento para realizar una desasociación en favor de algún componente que ofrezaca la interfaz dissasociateMedia', (done) => {
				DummyMediaComponent.associateMedia({id:1})
				DummyMediaComponent.requestMediaDisassociation() 
				tick(() => {
					expect(MM.active_calling_component.component_name).toEqual(DummyMediaComponent.component_name)
					expect(MM.disassociate_media_id).toEqual(DummyMediaComponent.media.id)
					expect(vm.post).toHaveBeenCalledWith(document.getElementById('disassociate_photo_form'))
					done()
				})
			})
		
			it('pasa las valores necesarios a la forma de desasociación', (done) => {
				DummyMediaComponent.associateMedia({id:3})
				DummyMediaComponent.requestMediaDisassociation() 
				tick(() => {
					let form = $('#disassociate_photo_form')
					expect(form[0].action).toEqual('http://blaa.com/api/photos/3/disassociate')
					
					let photoableId = form.find('[name="photoable_id"]').val()
					expect(photoableId).toEqual('24')
					
					let photoableType = form.find('[name="photoable_type"]').val()
					expect(photoableType).toEqual('dummy-type')
					
					let use = form.find('[name="use"]').val()
					expect(use).toEqual('dummyuse')
					
					let class_ = form.find('[name="class"]').val()
					expect(class_).toEqual('some-class')
					
					let order = form.find('[name="order"]').val()
					expect(order).toEqual('null')
					
					done()
				})
			})
			it('informa al componente que hizo la petición del éxito de la misma y le manda el id de la media desasociada', (done) => {
				DummyMediaComponent.associateMedia({id:3})
				DummyMediaComponent.requestMediaDisassociation() 
				MM.onDisassociateSuccess()
				tick(() => {
					expect(DummyMediaComponent.media).toEqual({})
					expect(MM.active_calling_component).toEqual({})
					expect(MM.disassociate_media_id).toEqual(-1)
					done()
				})
			})
		})
		describe('[POST] Ordenamiento de medias de in componente (Sort), i.e. MultiImages', () => {
			it('puede hacer una petición a nombre del MultiImages para mandar el orden de las imágenes', (done) => {
				DummyMediaComponent.requestPhotosSorting()
				
				tick(() => {
					let form = $('#sortphotos_form')
					expect(form[0].action).toEqual('http://blaa.com/api/photos/sort')

					let photoableId = form.find('[name="photoable_id"]').val()
					expect(photoableId).toEqual('24')

					let photoableType = form.find('[name="photoable_type"]').val()
					expect(photoableType).toEqual('dummy-type')

					let use = form.find('[name="use"]').val()
					expect(use).toEqual('dummyuse')

					let class_ = form.find('[name="class"]').val()
					expect(class_).toEqual('some-class')

					let photos = form.find('[name="photos[]"]')

					MM.close()
					tick(() => {
						let photoableId = form.find('[name="photoable_id"]').val()
						expect(photoableId).toEqual('')

						let photoableType = form.find('[name="photoable_type"]').val()
						expect(photoableType).toEqual('')

						let use = form.find('[name="use"]').val()
						expect(use).toEqual('')

						let class_ = form.find('[name="class"]').val()
						expect(class_).toEqual('')

						done()
					})
				})
			});
		
			xit('puede mandar una alerta si la peticion fue exitosa', (done) => { });
			xit('puede mostrar un error si la peticion no fue exitosa', (done) => { });
		})	
	})
});


