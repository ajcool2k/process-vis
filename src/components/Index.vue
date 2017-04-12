<template>
    <div id="index">
        <router-link to="/draw">
            <button>Route zeichnen</button>
        </router-link>
        <router-link to="/hello">
            <button>Hello Vue</button>
        </router-link>
    </div>
</template>


<script>
    export default {
        name: 'Index',
        data: function() {
            return {}
        }
    }
</script>

<style>

</style>