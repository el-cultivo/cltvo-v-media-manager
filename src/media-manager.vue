<script>
  import {path, pathOr, compose} from 'ramda'
  import {numericalObjSort, objTextFilter} from 'coral-std-library'

  const tapN = n => x => {console.log(n, x); return x}

  const defaultChosenImage = {src:'', id:'', languages:[], en: {}, es: {}, index:'', photoable_id:'', photoable_type:'', use:'', class:'', order:''}
  const emptyComponent = {} 
  const noMediaId = -1

  const makeUrlWithId = route => id => {
    if(!route) {return '/'}
    if(route.indexOf(':id') === -1) {return route} 
    return route.split(':id').join(id)
  }

  let active_calling_component = {}

  export default {
    data() {
      return {
        store: {},
        display: 'none',
        hola: 'mundo',
        photos: [],
        chosen_image: defaultChosenImage,
        active_calling_component: emptyComponent,
        disassociate_media_id: noMediaId,
        file_input: '',
        DnDEvents: {
          bin: ''
        },
        search: '',
        sort_by: 'desc',
        sort_types: [
          {value: 'desc', name: {es: 'más recientes'}},
          {value: 'asc', name: {es: 'más antiguas'}}
        ],
      }
    },

    ready() {
      this.store = this.$root.store
    },

    computed: {
      filterableAndSortablePhotos() {
        let photos = compose(
          numericalObjSort(['updated_at'], this.sort_by), 
          objTextFilter(['title'], this.search)
        )(this.photos);
        return photos
      },

      createUrl() { return this.getRoute('create')},
      sortPhotosUrl() { return this.getRoute('sort_photos')},

      updateUrl() {return makeUrlWithId(this.getRoute('update'))(this.chosen_image.id)},
      deleteUrl() {return makeUrlWithId(this.getRoute('delete'))(this.chosen_image.id)},
      associateUrl() {return makeUrlWithId(this.getRoute('associate'))(this.chosen_image.id)},
      disassociateUrl() {return makeUrlWithId(this.getRoute('disassociate'))(this.disassociate_media_id)},

      singleImageRoute() {
        return compose(
          route => id => route+'/'+id,
          pathOr('', ['store', 'media_manager', 'routes', 'single_image'])
        )(this)
      }
    },

    methods: {
      open() {
        this.display = 'block'
        this.getPhotos()
      },

      close() {
        this.display = 'none'
        this.chosen_image = defaultChosenImage;
        this.active_calling_component = emptyComponent;
      },

      getRoute(mm_route_name) { 
        return path(['$root', 'store', 'media_manager', 'routes', mm_route_name], this)
      },

      
      getPhotos() {
        const root = this.$root
        root.get(
          root.store.media_manager.routes.index, 
          {
            success: 'onGetPhotosSuccess',
            error: 'onGetPhotosError'
          }
        )
      },
      
      onGetPhotosSuccess(body) {
        this.photos = pathOr([], ['data', 'photos'], body)                    
      },
    
      onGetPhotosError(body) {
        this.$root.alertError(body)
      },
      
      post(evt) {
        return this.$root.post(evt)
      },
      
      makePost(form_id) {
        this.$root.post(document.getElementById(form_id));
      },

      onCreateSuccess(body, input) {
        this.photos.unshift(body.data);
  			input.reset();
      },

      chooseImage(id) {
        compose(
          this.getChosenImage,
          makeUrlWithId(this.getRoute('single_image'))
        )(id)
      },

      getChosenImage(route) {
        this.$root.get(route, {
          success: 'onGetChosenImageDataSuccess',
          error: 'onGetChosenImageDataError'
        })
      },

      onGetChosenImageDataSuccess(body) {
        this.chosen_image = body
      },

      onAssociateSuccess(body, input) {
        this.active_calling_component.associateMedia(this.chosen_image)//pasamos la imagen asociada
        this.$root.$nextTick(() => {
          this.close();
        })
      },
      
      onDisassociateSuccess(body, input) {
        this.active_calling_component.disassociateMedia(this.disassociate_media_id)
        this.active_calling_component = emptyComponent
        this.disassociate_media_id = noMediaId
      },

      onSortphotosSuccess(body, input) {
        this.active_calling_component = emptyComponent
      }
    },

    events: {
      callMediaManagerBroadcast(component_name, component) {
        this.active_calling_component = component
        this.open()
      },

      dissaociateMediaBroadcast(component_name, component, media_id) {
        this.disassociate_media_id = media_id
        this.active_calling_component = component
        this.$root.post(document.getElementById('disassociate_photo_form'))
      },

      associateMedia(component_type, component) {
        let callback = {
          singleImage: this.associateImage,
          gallery: this.associateImage
        }[component_type] || (x => console.log('hubo un error, el componente '+ component_type + 'no tiene una respuesta asociada para [associateMedia], o fue llamado con los argumentos incorrectos ' + x))
      },
      sortPhotosBroadcast(component_name, component, ordered_ids) {
          this.active_calling_component = component
          this.$root.post(document.getElementById('sortphotos_form'))
      }
  }    
}
</script>

<template lang="pug">
  include forms/photos-association-forms
  #media-manager(:style="{'display': display}")
    #media-manager-images-container
      .media-manager__image(
        v-for="image in photos"
        :style="{'backgroundImage': 'url('+image.thumbnail_url+')'}"
      )

      include forms/create-photo
      
      include forms/update-photo
      
      include forms/delete-photo

      +photo_assoc_form('associate_photo_form', 'POST', 'associateUrl')

      +photo_assoc_form('disassociate_photo_form', 'DELETE', 'disassociateUrl')
      include forms/sort-photos-form
      
</template>

<style>
</style>