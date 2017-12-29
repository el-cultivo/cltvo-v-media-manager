<script>
  import {path, pathOr, compose} from 'ramda'
  import {numericalObjSort, objTextFilter} from 'coral-std-library'

  export default {
      data() {
         return {
              chosen_image: {}
         }
      },

      props: [
          'id', //string
          'currentImage', //{id: Int, url: String, thumbnail_url: String}
          'photoableId', //Int
          'photoableType', //String
          'use', //String
          'class', //String
          'order',//Int | Null
      ],
      
      ready() {
        this.chosen_image = this.currentImage 
      },

      methods: {
            callMM() {
				this.$dispatch('callMediaManager', 'SingleImage', this)
			},

            associateMedia(image) {
                this.chosen_image = image
            },

            requestMediaDisassociation() {
				this.$dispatch('mediaDissasociationRequest', 'SingleImage', this, this.chosen_image.id)
			},

            disassociateMedia(image_id) {
                if(this.chosen_image.id === image_id) {
                    this.chosen_image = {}
                } else {
                    console.error('Hubo en error al tratar de desasociar la imagen del SingleImage')
                }
            }
      }
  }
</script>

<template lang="pug">
    div.single-image(:id="id")
        div(v-text="hola")      
</template>

<style>
</style>