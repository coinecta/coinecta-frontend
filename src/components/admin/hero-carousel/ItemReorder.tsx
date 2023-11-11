import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Paper, useTheme } from '@mui/material';

interface DraggableListProps {
  carouselItems: THeroCarouselWithIds[];
  reorderItemsOnBackend: (newOrder: number[]) => void;
}

const DraggableList: React.FC<DraggableListProps> = ({ carouselItems, reorderItemsOnBackend }) => {
  const theme = useTheme()

  const reorder = (list: THeroCarouselWithIds[], startIndex: number, endIndex: number): THeroCarouselWithIds[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (result: any) => { // Use the appropriate type for 'result' based on 'react-beautiful-dnd' types
    if (!result.destination) {
      return;
    }

    const items = reorder(
      carouselItems,
      result.source.index,
      result.destination.index
    );

    reorderItemsOnBackend(items.map((item) => item.id));
  };

  const getItemStyle = (isDragging: boolean, draggableStyle: React.CSSProperties): React.CSSProperties => ({
    userSelect: 'none',
    padding: 16,
    margin: '0 0 8px 0',
    border: `1px solid ${theme.palette.divider}`,
    background: isDragging ? 'grey' : theme.palette.background.paper,
    // styles need to apply on draggables
    ...draggableStyle,
  });

  const getListStyle = (isDraggingOver: boolean): React.CSSProperties => ({
    background: isDraggingOver ? theme.palette.divider : theme.palette.background.paper,
    padding: 8,
    paddingBottom: 0
  });

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <Paper
            variant="outlined"
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
            {...provided.droppableProps}
          >
            {carouselItems.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                {(provided, snapshot) => (
                  <Paper
                    ref={provided.innerRef}
                    variant="outlined"
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style || {})}
                  >
                    {item.title}
                  </Paper>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Paper>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableList;