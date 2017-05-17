<template>
    <div id="index">
        <p>App:         
            <router-link to="/process">
                <button>Process-Vis</button>
            </router-link>
        </p>

            <p>Demos:
            <!--
            <router-link to="/draw">
                <button>Route zeichnen</button>
            </router-link>

            <router-link to="/draw2">
                <button>CyDemo</button>
            </router-link>
            -->
            <router-link to="/flexbox">
                <button>Flexbox</button>
            </router-link>

            <router-link to="/draw3">
                <button>D3demo</button>
            </router-link>

            <router-link to="/gantt">
                <button>D3Gantt</button>
            </router-link>
        </p>

        <div class="logo">
            <img src="../assets/logo.png" draggable="true">
        </div>    

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