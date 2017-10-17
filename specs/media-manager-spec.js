import Vue from 'vue'
import MediaManager from '../src/media-manager.vue'
import {photos} from './media-manager/photos'

const tick = Vue.nextTick

fdescribe('MediaManager', () => {
	let vm = {}
	let MM;

	beforeEach(() => {//Configuración previa al test
		vm = new Vue({//creamos una instancia de Vue que nos sirva para el test
			replace:false,//no es necesario fuera del test, es sólo para cuando usamos el método mount sobre el body
			template: `
			<div id="main-vue">
				<media-manager></media-manager>
			</div>`,//metemos nuestro componente en el template de la instancia e Vue.  Como se ve podemos pasar props
			mixins: [],
			// ready() {console.log(this.$children);},
			data: {
				store: {
					media_manager: {
						routes: {
							index: 'http://blaa.com/api/photos',
							single_image: 'http://blaa.com/api/photos',
							create: 'http://blaa.com/api/photos',
							update: 'http://blaa.com/api/photos',
							delete: 'http://blaa.com/api/photos',
							associate: 'http://blaa.com/api/photos',
							disassociate: 'http://blaa.com/api/photos',
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
				MediaManager
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
			}
		}).$mount('body')//esto tambien es para el test

		MM = vm.$children[0]//guardamos el child en la variable, para facilitar nuestro acceso a ella

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
				
				let urls = images.map((i, el) => $(el).css('background-image').replace('url(', '').replace(')', '')).toArray()
				
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
				expect(MM.getChosenImage).toHaveBeenCalledWith(vm.store.media_manager.routes.single_image+'/'+id)
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
		xit('al seleccionar una imagen, forma la ruta correcta del action de la forma', (done) => {});
		xit('muestra mensaje de exito la petición fue aceptada', (done) => {});
		xit('puede mostrar un error si la peticion no fue exitosa', (done) => {});
	})

	describe('[DELETE] Eliminación de medias', ()=> {
		xit('puede hacer una petición DELETE ajax para eliminar una imagen', (done) => {
			spyOn(MM, 'post')
			MM.post(document.getElementById('delete_photo_form'))
			expect(document.getElementById('delete_photo_form').length).toEqual(1)
			expect(MM.post).toHaveBeenCalledWith(document.getElementById('delete_photo_form'))
			done()
		});
		xit('al seleccionar una imagen, forma la ruta correcta del action de la forma', (done) => {});
		xit('puede actualizar las imágenes que se muestran si se elimina exitosamente la imagen', (done) => {});
		xit('puede mostrar un error si la peticion no fue exitosa', (done) => {});
	})

	describe('[Forms]', () => {
		it('mandan los campos _method y _token correctos', () => {
			tick(() => {
				let tokens = $('form')
					.map((i, f)=> $(f).find('[name="_token"]').val())
					.toArray()
					.reduce((a, b) =>  a === b ? a : 'error', 'dameltoke')

				expect(tokens).toEqual('dameltoke')

				expect($('#update_photo_form').find('[name="_method"]').val()).toEqual('PATCH')
				expect($('#delete_photo_form').find('[name="_method"]').val()).toEqual('DELETE')
			})
		})
	})

	describe('Interacción con otros componentes', ()=>{
		describe('Invocación por parte de un componente', () => {
			xit('puede ser abierto por un componente', (done) => {});
			xit('puede recibir una referencia al componente que lo invoca (el "this" del componente)', (done) => {});
			xit('puede eliminar esta referencia una vez que se cierra', (done) => {});
		})
		describe('[POST] Asociación de medias', () => {
			xit('puede hacer una petición a nombre de SingleImage y Gallery para asociar una imágen a un recurso (página, post, etc.)', (done) => {});
			xit('puede mandar la imagen y otros metadatos al SingleImage o a Gallery si la respuesta fue exitosa (esto invocando un método callback propio del componente que llamó al Media Manager)'/*ver 'Invocación por parte de un componente'*/, (done) => {});
			xit('puede mostrar un error si la peticion no fue exitosa', (done) => {});			
		})	
	})

	describe('Orden y Filtros', () => {
		xit('puede ordenar fotos por fecha', (done) => {});
		xit('puede filtrar fotos por título', (done) => {});
	})

});


