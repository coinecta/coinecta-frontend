import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { IconButton, List, ListItem, ListItemText, Paper, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface DraggableListProps {
  salesTerms: ISalesTerm[];
  setNewOrder: (newOrder: ISalesTerm[]) => void;
  removeSalesTerm: (i: number) => void;
}

const SalesTermsReorder: React.FC<DraggableListProps> = ({ salesTerms, setNewOrder, removeSalesTerm }) => {

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(salesTerms);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setNewOrder(items);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="salesTerms">
        {(provided) => (
          <List {...provided.droppableProps} ref={provided.innerRef}>
            {salesTerms.map((term, index) => (
              <Draggable key={index} draggableId={`term-${index}`} index={index}>
                {(provided) => (
                  <ListItem
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => removeSalesTerm(index)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <DragIndicatorIcon sx={{ mr: 2 }} />
                    <ListItemText primary={term.header} secondary={term.bodyText} />
                  </ListItem>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </List>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default SalesTermsReorder;