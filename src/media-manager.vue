<script>
  import {path, pathOr, compose} from 'ramda'
  import {numericalObjSort, objTextFilter} from 'coral-std-library'
  import axios from 'axios'

  const tap = x => {console.log(x); return x}
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
        axios: axios,
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
      },

      imagesContainerClass() {
        return {
          'col s10': this.chosen_image.src === '',
          'col s6': this.chosen_image.src !== ''
        }
      },

      imageClass() {
        return {
            'col s2': this.chosen_image.src === '',
            'col s3': this.chosen_image.src !== ''
        }
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
        this.axios.get(this.$root.store.media_manager.routes.index)
          // .then(tap)
          .then(body => {this.photos = pathOr([], ['data', 'photos'], body)})
          .catch(body => { this.$root.alertError(body)})
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
        this.axios.get(route)
          .then(body => 
              this.chosen_image = body.data
          )
          .catch(body => this.$root.alertError(body))
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
  #media-manager(
    :style="{'display': display}"
    class=" media-manager__modal-container media-manager__manage-img fade undraggable-unselectable-cascading"
  )
    #media-manager__drop-container.media-manager__drop-container(
      v-on:click.self="close"
    )
      #media-manager__droppable-area.media-manager__droppable-area
        .media-manager__icon-photo-container
          span.fa.fa-file-image-o.media-manager__icon-photo
          span.media-manager__icon-photo.media-manager__icon-photo--text(v-text="store.media_manager.trans.drag")
      
      .modal-dialog.modal-lg.media-manager__modal.media-manager__manage-img-dialog.z-depth-2
        .modal-content
          //-header
          .modal-body.media-manager__manage-img-body
            .row.media-manager__row
              .col.s2
                input.input.input__search(
                  v-model="search"
                  :placeholder="store.media_manager.trans.search.placeholder"
                  type="search"
                )
              
              .col.s10
                label(for="sort" v-text="store.media_manager.trans.filter.title")
                select.form-control(
                  v-model="sort_by"
                  :placeholder="store.media_manager.trans.filter.placeholder"
                  name="sort"
                )
                  option(
                    v-for="order in sort_types"
                    :value="order.value"
                    v-text="order.name.es"
                  )
            
            .row
              .col.s2
                include forms/create-photo
              .media-manager__manage-img-scroll(
                :class="imagesContainerClass"
              )
                .row
                  .media-manager__img-container.undraggable(
                    v-for="image in photos"
                    :class="imageClass"
                    v-on:click="chooseImage(image.id)"
                  )
                    div(
                      data-image-url="{{image.thumbnail_url}}"
                      data-id="{{image.id}}"
                      data-index="{{$index}}"
                      class="transition-slow hover-scale-up undraggable media-manager__img-container--position"
                      v-bind:style="{backgroundImage: 'url(' + image.thumbnail_url +')', height : 100 + '%'}"
                    )
              .col.s4
                .media-manager__manage-img-details(
                  :class="{'media-manager__manage-img-details--image-is-selected': chosen_image.src !== ''}"
                )
                  .row
                    //- .right.media-manager__back(style="display:none")
                    .right.media-manager__back() &#10005;
                    .col.s5
                      img(:src="chosen_image.src")
                    .col.s7
                      span.media-manager__text(v-text="chosen_image.es_title")
                      span.media-manager__text.media-manager__text--info(
                        v-if="chosen_image.created_at"
                        v-text="chosen_image.created_at"
                      )
                      include forms/delete-photo
                  
                  .row
                    .col.s12 
                      .divider
                  
                  .row
                    include forms/update-photo


      
      +photo_assoc_form('associate_photo_form', 'POST', 'associateUrl')

      +photo_assoc_form('disassociate_photo_form', 'DELETE', 'disassociateUrl')
      include forms/sort-photos-form
      
</template>

<style>
</style>