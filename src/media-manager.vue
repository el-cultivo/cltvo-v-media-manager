<script>
  const defaultChosenImage = {src:'', id:'', languages:[], en: {}, es: {}, index:'', photoable_id:'', photoable_type:'', use:'', class:'', order:''}

  import {path, pathOr, compose} from 'ramda'
  import {numericalObjSort, objTextFilter} from 'coral-std-library'

  const emptyComponent = {}

  let getRoute = x =>  'esta función debe se sobreescribirse en el ready'

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
      getRoute = mm_route_name => path(['$root', 'store', 'media_manager', 'routes', mm_route_name], this)
    },

    computed: {
      filterableAndSortablePhotos() {
        let photos = compose(
          numericalObjSort(['updated_at'], this.sort_by), 
          objTextFilter(['title'], this.search)
        )(this.photos);
        return photos
      },

      createUrl() { return getRoute('create')},

      updateUrl() {return makeUrlWithId(getRoute('update'))(this.chosen_image.id)},
      deleteUrl() {return makeUrlWithId(getRoute('delete'))(this.chosen_image.id)},

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
        this.post(document.getElementById(form_id));
      },

      onCreateSuccess(body, input) {
        this.photos.unshift(body.data);
  			input.reset();
      },

      chooseImage(id) {
        compose(
          this.getChosenImage,
          makeUrlWithId(getRoute('single_image'))
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
        this.active_calling_component.associateMedia(body.data)//pasamos la imagen asociada
      },
    },

    events: {
      callMediaManagerBroadcast(component_name, component) {
        this.active_calling_component = component
        this.open()
      },

      associateMedia(component_type, component) {
        let callback = {
          singleImage: this.associateImage,
          gallery: this.associateImage
        }[component_type] || (x => console.log('hubo un error, el componente '+ component_type + 'no tiene una respuesta asociada para [associateMedia], o fue llamado con los argumentos incorrectos ' + x))
      }
  }    
}
</script>

<template lang="pug">
  #media-manager(:style="{'display': display}")
    #media-manager-images-container
      .media-manager__image(
        v-for="image in photos"
        :style="{'backgroundImage': 'url('+image.thumbnail_url+')'}"
      )


      include forms/create-photo
      
      include forms/update-photo
      
      include forms/delete-photo

</template>

<style>
</style>