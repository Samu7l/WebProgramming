function showRecipe(recname) {


    if(recname==="avocado"){
        let target=document.getElementById("avocado");
        target.removeAttribute('hidden');
    }
}




/*
function showRecipe(id) {
    // Hide all recipe details first
    const allDetails = document.querySelectorAll('.recipe-details');
    allDetails.forEach((el) => el.classList.add('hidden'));

    // Then show the one we want
    const target = document.getElementById(id);
    if (target) {
        target.classList.remove('hidden');
    }

 */