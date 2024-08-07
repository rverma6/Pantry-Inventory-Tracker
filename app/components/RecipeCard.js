// RecipeCard.js
import React from 'react';
import { Card, CardContent, CardMedia, CardActionArea, Typography } from '@mui/material';

const RecipeCard = ({ recipe }) => {
  return (
    <Card className="bg-gray-700 text-white rounded shadow mb-2">
      <CardActionArea href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
        {recipe.image && (
          <CardMedia
            component="img"
            height="140"
            image={recipe.image}
            alt={recipe.title}
          />
        )}
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {recipe.title}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default RecipeCard;
