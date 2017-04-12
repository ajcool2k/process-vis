<template>
    <div id="index">
        <div class="logo">
            <img src="../assets/logo.png" draggable="true">
        </div>    
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

<style scoped>
    .logo img {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -80%);
    }
</style>