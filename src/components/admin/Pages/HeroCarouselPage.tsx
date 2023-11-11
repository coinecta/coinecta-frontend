import { ChangeEvent, FC, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Paper
} from '@mui/material';
import { useState } from 'react';
import { trpc } from '@lib/utils/trpc';
import AdminMenu from '@components/admin/AdminMenu';
import { useAlert } from '@contexts/AlertContext';
import Grid from '@mui/system/Unstable_Grid/Grid';
import { slugify } from '@lib/utils/general';
import FileUploadS3 from '@components/FileUploadS3';
import { useDialog } from '@contexts/DialogContext';
import DraggableList from '../hero-carousel/ItemReorder';

const HeroCarouselPage: FC = () => {
  const { addAlert } = useAlert();
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [selectedDeleteItem, setSelectedDeleteItem] = useState<number | null>(null);
  const [formItem, setFormItem] = useState<THeroCarousel>({
    title: '',
    subtitle: '',
    image: '',
    buttonTitle: '',
    buttonLink: ''
  });
  const [isLoading, setLoading] = useState(false);

  const { data: carouselItems, refetch } = trpc.hero.getHeroItems.useQuery();
  const addCarouselMutation = trpc.hero.addHeroItem.useMutation();
  const updateCarouselMutation = trpc.hero.updateHeroItem.useMutation();
  const reorderCarouselMutation = trpc.hero.reorderHeroItems.useMutation();
  const deleteCarouselMutation = trpc.hero.deleteHeroItem.useMutation();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormItem(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setSelectedItem(null);
    setFormItem({
      title: '',
      subtitle: '',
      image: '',
      buttonTitle: '',
      buttonLink: ''
    });
  }

  const handleSelectChange = (e: SelectChangeEvent) => {
    const id = e.target.value;
    if (id !== '') {
      const item = carouselItems?.find((item) => item.id?.toString() === id);
      setSelectedItem(item?.id || null);
      setFormItem(item || {
        title: '',
        subtitle: '',
        image: '',
        buttonTitle: '',
        buttonLink: ''
      });
    } else {
      resetForm()
    }
  };

  const handleImageUpload = (res: { status: string; image_url?: string; message?: string }) => {
    if (res.status === 'success') {
      setFormItem(prev => ({ ...prev, image: res.image_url! }));
      addAlert(
        'success',
        res.message || 'Image uploaded'
      );
    } else {
      addAlert(
        'error',
        'Image upload failed'
      );
    }
  };

  const validateForm = () => {
    return {
      title: !formItem.title.trim(),
      subtitle: !formItem.subtitle.trim(),
      buttonTitle: !formItem.buttonTitle.trim(),
      buttonLink: !formItem.buttonLink.trim(),
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const errors = validateForm();
    const hasErrors = Object.values(errors).some((error) => error);
    if (hasErrors) {
      addAlert('error', 'Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      if (selectedItem) {
        // Update logic here, assuming 'id' is part of formItem for simplicity
        await updateCarouselMutation.mutateAsync({ ...formItem, id: selectedItem });
        addAlert('success', 'Carousel item updated successfully!');
      } else {
        // Add logic here, assuming 'formItem' doesn't have 'id'
        await addCarouselMutation.mutateAsync(formItem);
        addAlert('success', 'Carousel item added successfully!');
      }
    } catch (error) {
      addAlert('error', error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      resetForm()
      setLoading(false);
      refetch(); // Refetch carousel items after mutation
    }
  };

  const [newOrder, setNewOrder] = useState<number[]>([])
  const [orderedItems, setOrderedItems] = useState<THeroCarouselWithIds[]>([])

  useEffect(() => {
    if (carouselItems !== undefined) setOrderedItems(carouselItems)
  }, [carouselItems])

  const handleReoderItems = (newOrder: number[]) => {
    const newOrderedItems = newOrder.map(id =>
      orderedItems.find(item => item.id === id)
    ).filter((item): item is THeroCarouselWithIds => item !== undefined);

    setOrderedItems(newOrderedItems);
    setNewOrder(newOrder);
  }

  const handleSubmitNewOrder = async () => {
    try {
      if (newOrder.length === carouselItems?.length) {
        await reorderCarouselMutation.mutateAsync(newOrder);
        addAlert('success', 'New order applied');
      } else {
        addAlert('error', 'Unable to apply new order');
      }
    } catch (error) {
      addAlert('error', error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      resetForm()
      setLoading(false);
      refetch();
    }
  }

  const handleSelectDeleteChange = (e: SelectChangeEvent) => {
    const id = e.target.value;
    if (id !== '') {
      const item = carouselItems?.find((item) => item.id?.toString() === id);
      setSelectedDeleteItem(item?.id || null);
    }
  };

  const { showDialog, hideDialog } = useDialog();
  const handleDeleteConfirm = () => {
    showDialog({
      title: "Confirm delete",
      description: `Are you sure you want to do delete ${carouselItems?.find((item) => item.id === selectedDeleteItem)?.title}?`,
      buttons: [
        { text: "Cancel", onClick: hideDialog },
        {
          text: "Confirm", onClick: () => {
            handleDelete();
            hideDialog();
          }
        },
      ],
    });
  };

  const handleDelete = async () => {
    try {
      if (selectedDeleteItem) {
        // Update logic here, assuming 'id' is part of formItem for simplicity
        await deleteCarouselMutation.mutateAsync({ id: selectedDeleteItem });
        addAlert('success', 'Carousel item deleted successfully!');
      } else {
        addAlert('error', 'You must select an item to delete');
      }
    } catch (error) {
      addAlert('error', error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      resetForm()
      setLoading(false);
      refetch();
    }
  }

  return (
    <AdminMenu>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h2" sx={{ mt: 10, mb: 4, fontWeight: '700' }}>
          Hero Carousel Items
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Add or Edit
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="select-existing-label">Edit existing item</InputLabel>
          <Select
            labelId="select-existing-label"
            id="select-existing"
            value={selectedItem?.toString() || ''}
            label="Edit existing item"
            onChange={handleSelectChange}
          >
            {carouselItems?.map((item) => (
              <MenuItem key={item.id} value={item.id.toString()}>
                {item.title}
              </MenuItem>
            ))}
            <MenuItem value="">Create new</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          required
          name="title"
          label="Title"
          variant="filled"
          value={formItem.title}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          required
          name="subtitle"
          label="Subtitle"
          variant="filled"
          value={formItem.subtitle}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              required
              name="buttonTitle"
              label="Button Title"
              variant="filled"
              value={formItem.buttonTitle}
              onChange={handleChange}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              required
              name="buttonLink"
              label="Button Link"
              variant="filled"
              value={formItem.buttonLink}
              onChange={handleChange}
            />
          </Grid>
          <Grid xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, justifyContent: 'space-between' }}>
              <TextField
                InputProps={{ disableUnderline: true }}
                disabled
                sx={{ flexGrow: 1, flexBasis: 'auto', flexShrink: 1 }}
                name="image"
                label="Image URL"
                variant="filled"
                value={formItem.image}
                onChange={handleChange}
              />
              <FileUploadS3 onUpload={handleImageUpload} fileName={`${slugify(formItem.title)}-image`} />
            </Box>
          </Grid>
          {formItem.image &&
            <Grid xs={12}>
              <Paper
                sx={{
                  display: 'inline-flex',
                  // p: 1,
                  mx: 'auto',
                  overflow: 'hidden',
                  lineHeight: 0,
                }}
                variant="elevation"
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    width: 'auto',
                    height: 'auto',
                  }}
                >
                  <img
                    src={formItem.image}
                    alt={`${formItem.title} image`}
                    style={{
                      maxWidth: '100%',
                      width: 'auto',
                      height: 'auto',
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          }
          <Grid xs={12}>
            <Button type="submit" variant="contained" disabled={isLoading}>
              Submit
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 6 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Reorder Items
        </Typography>
        <Box sx={{ mb: 2 }}>
          {orderedItems && <DraggableList
            carouselItems={orderedItems}
            reorderItemsOnBackend={handleReoderItems}
          />}
        </Box>
        <Button variant="contained" onClick={handleSubmitNewOrder}>
          Submit new order
        </Button>
      </Box>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Delete an item
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="select-delete-label">Select item to delete</InputLabel>
        <Select
          labelId="select-delete-label"
          id="select-delete"
          value={selectedDeleteItem?.toString() || ''}
          label="Select item to delete"
          onChange={handleSelectDeleteChange}
        >
          {carouselItems?.filter(item => item.id !== 1).map((item) => (
            <MenuItem key={item.id} value={item.id.toString()}>
              {item.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="contained" onClick={handleDeleteConfirm}>
        Delete
      </Button>
    </AdminMenu>
  );
};

export default HeroCarouselPage;
