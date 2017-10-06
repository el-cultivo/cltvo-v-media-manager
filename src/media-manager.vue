<script>
  import {path, pathOr} from 'ramda'
  export default {
    data() {
      return {
        display: 'none',
        hola: 'mundo',
        photos: [],
        DnDEvents: {
          bin: ''
        }
      }
    },

    methods: {
      open() {
        this.display = 'block'
        this. getPhotos()
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

      form#create_photo_form.input__file.media-manager__file-container(
        method="POST"
        :action="undefined"
        role="form"
        v-on:submit.prevent="post"
      )
        label#file_input-label(for="file_input")
          span.fa.fa-camera.media-manager__icon-camera(v-if="DnDEvents.bin === ''")
          span.media-manager__icon-camera.media-manager__icon-camera--add(v-if="DnDEvents.bin === ''") Agregar
          span.media-manager__icon-camera.media-manager__icon-camera--change.media-manager__icon-camera--change(v-if="DnDEvents.bin === ''") Cambiar
        input#media-manager__droppable-input.hide-input.hide-button.media-manager__droppable-input(
          v-model="file_input"
          v-on:change="makePost"
          form="create_photo_form"
          type="file" 
          required="true"
        )
</template>

<style>

</style>