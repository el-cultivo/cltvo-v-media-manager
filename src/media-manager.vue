<script>
  const defaultChosenImage = {src:'', id:'', languages:[], en: {}, es: {}, index:'', photoable_id:'', photoable_type:'', use:'', class:'', order:''}

  import {path, pathOr, compose} from 'ramda'
  import {numericalObjSort, objTextFilter} from 'coral-std-library'

  export default {
    data() {
      return {
        store: {},
        display: 'none',
        hola: 'mundo',
        photos: [],
        chosen_image: defaultChosenImage,
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
        this.getChosenImage(this.singleImageRoute(id))
      },

      getChosenImage(route) {
        this.$root.get(route, {
          success: 'onGetChosenImageDataSuccess',
          error: 'onGetChosenImageDataError'
        })
      },

      onGetChosenImageDataSuccess(body) {
        this.chosen_image = body
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