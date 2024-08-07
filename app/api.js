// api.js
export const getRecipes = async (ingredients) => {
    const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
    const ingredientsList = ingredients.join(',');
    const apiUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientsList}&number=10&apiKey=${apiKey}`;
  
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
  
      // Fetch detailed recipe information for each recipe
      const detailedRecipes = await Promise.all(
        data.map(async (recipe) => {
          const detailsResponse = await fetch(`https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${apiKey}`);
          const detailsData = await detailsResponse.json();
          return {
            id: recipe.id,
            title: recipe.title,
            sourceUrl: detailsData.sourceUrl,
            image: recipe.image,
          };
        })
      );
  
      return detailedRecipes;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }
  };
  