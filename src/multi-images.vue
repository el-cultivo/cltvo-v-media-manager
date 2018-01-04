<script>
  import {find, path, pathOr, compose} from 'ramda'
  import {numericalObjSort, objTextFilter, moveInArray} from 'coral-std-library'

  export default {
      data() {
         return {
             hola: 'mundo',
              chosen_images: []
         }
      },

      props: [
          'id', //string
          'allPhotos', //[{id: Int, url: String, thumbnail_url: String}]
          'photoableId', //Int
          'photoableType', //String
          'use', //String
          'class', //String
          'order',//Int | Null
      ],
      
      ready() {
        this.chosen_images = this.allPhotos || [] 
      },

      computed: {
          orderedIds() {
              return this.chosen_images.map(img => img.id)
          }
      },
      
      methods: {
            callMM() {
				this.$dispatch('callMediaManager', 'MultiImages', this)
			},

            associateMedia(image) {
                this.chosen_images.push(image)
            },

            requestMediaDisassociation(image_id) {
                let image = find(img => img.id === image_id, this.chosen_images)
                if(path(['id'], image) !== undefined) {
                    this.$dispatch('mediaDissasociationRequest', 'MultiImages', this, image.id)
                } else {
                    console.error('Hubo en error al tratar de desasociar una imagen del MultiImages: no se encontró la imágen')
                }
			},

            disassociateMedia(image_id) {
                if(find(img => img.id === image_id, this.chosen_images) !== undefined) {
                    this.chosen_images = this.chosen_images.filter(img => img.id !== image_id)
                } else {
                    console.error('Hubo en error al tratar de desasociar una imagen del MultiImages')
                }
            },

            onSortUpdate({oldIndex, newIndex}) {//del sort
                this.chosen_images = moveInArray(
                        newIndex - oldIndex, 
                        oldIndex, 
                        this.chosen_images
                    )
            },        
      }
  }
</script>

<template lang="pug">
    div.multi-images(:id="id")
        div(v-for="image in chosen_images")
            div.multi-images__img(:style="{backgroundImage: 'url('+image.thumbnail_url+')'}")
</template>

<style>
</style>