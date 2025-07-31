import React, { Component } from 'react';
import {
  Button, TextField, Dialog, DialogActions, LinearProgress,
  DialogTitle, DialogContent, TableBody, Table,
  TableContainer, TableHead, TableRow, TableCell
} from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import swal from 'sweetalert';
import { withRouter } from './utils';
import axios from 'axios'; 

class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      token: '',
      openProductModal: false,
      openProductEditModal: false,
      id: '',
      name: '',
      desc: '',
      price: '',
      discount: '',
      page: 1,
      search: '',
      products: [],
      pages: 0,
      loading: false
    };
  }

  componentDidMount = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      this.props.navigate("/login");
    } else {
      this.setState({ token }, this.getProduct);
    }
  }

  getProduct = () => {
    this.setState({ loading: true });
    const params = new URLSearchParams({
      page: this.state.page,
      ...(this.state.search && { search: this.state.search })
    });
    axios.get(`http://localhost:2000/get-product?${params}`, {
      headers: { token: this.state.token }
    })
    .then((res) => {
      this.setState({
        loading: false,
        products: Array.isArray(res.data.products) ? res.data.products : [],
        pages: res.data.pages || 0
      });
    })
    .catch((err) => {
      swal({ text: err.response?.data?.errorMessage || 'Error fetching products.', icon: "error" });
      this.setState({ loading: false, products: [], pages: 0 });
    });
  }

  deleteProduct = (id) => {
    axios.post('http://localhost:2000/delete-product', { id }, {
      headers: { 'Content-Type': 'application/json', token: this.state.token }
    })
    .then((res) => {
      swal({ text: res.data.title, icon: "success" });
      this.setState({ page: 1 }, () => this.pageChange(null, 1));
    })
    .catch((err) => {
      swal({ text: err.response?.data?.errorMessage || 'Error deleting product.', icon: "error" });
    });
  }

  pageChange = (e, page) => {
    this.setState({ page }, this.getProduct);
  }

  logOut = () => {
    localStorage.setItem('token', null);
    this.props.navigate("/");
  }

  onChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value }, () => {
      if (name === 'search') {
        this.setState({ page: 1 }, this.getProduct);
      }
    });
  };

  addProduct = () => {
    axios.post('http://localhost:2000/add-product', {
      name: this.state.name,
      desc: this.state.desc,
      discount: this.state.discount,
      price: this.state.price
    }, {
      headers: { 'Content-Type': 'application/json', token: this.state.token }
    })
    .then((res) => {
      swal({ text: res.data.title, icon: "success" });
      this.handleProductClose();
      this.setState({ name: '', desc: '', discount: '', price: '', page: 1 }, this.getProduct);
    })
    .catch((err) => {
      swal({ text: err.response?.data?.errorMessage || 'Error adding product.', icon: "error" });
      this.handleProductClose();
    });
  }

  updateProduct = () => {
    axios.post('http://localhost:2000/update-product', {
      id: this.state.id,
      name: this.state.name,
      desc: this.state.desc,
      discount: this.state.discount,
      price: this.state.price
    }, {
      headers: { 'Content-Type': 'application/json', token: this.state.token }
    })
    .then((res) => {
      swal({ text: res.data.title, icon: "success" });
      this.handleProductEditClose();
      this.setState({ name: '', desc: '', discount: '', price: '' }, this.getProduct);
    })
    .catch((err) => {
      swal({ text: err.response?.data?.errorMessage || 'Error updating product.', icon: "error" });
      this.handleProductEditClose();
    });
  }

  handleProductOpen = () => {
    this.setState({
      openProductModal: true,
      id: '', name: '', desc: '', price: '', discount: ''
    });
  };

  handleProductClose = () => this.setState({ openProductModal: false });

  handleProductEditOpen = (data) => {
    if (data && typeof data === 'object') {
      const { _id, name, desc, price, discount } = data;
      this.setState({
        openProductEditModal: true,
        id: _id || '',
        name: name || '',
        desc: desc || '',
        price: price || '',
        discount: discount || ''
      });
    } else {
      swal({ text: 'Invalid product data for editing.', icon: "error" });
    }
  };

  handleProductEditClose = () => this.setState({ openProductEditModal: false });

  render() {
    return (
      <div>
        {this.state.loading && <LinearProgress size={40} />}
        <div>
          <h2>Dashboard</h2>
          <Button variant="contained" color="primary" size="small" onClick={this.handleProductOpen}>Add Product</Button>
          <Button variant="contained" size="small" onClick={this.logOut}>Log Out</Button>
        </div>

        {/* Add Product Dialog */}
        <Dialog open={this.state.openProductModal} onClose={this.handleProductClose}>
          <DialogTitle>Add Product</DialogTitle>
          <DialogContent>
            <TextField name="name" value={this.state.name} onChange={this.onChange} placeholder="Product Name" /><br />
            <TextField name="desc" value={this.state.desc} onChange={this.onChange} placeholder="Description" /><br />
            <TextField name="price" type="number" value={this.state.price} onChange={this.onChange} placeholder="Price" /><br />
            <TextField name="discount" type="number" value={this.state.discount} onChange={this.onChange} placeholder="Discount" /><br />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleProductClose} color="primary">Cancel</Button>
            <Button disabled={!this.state.name || !this.state.desc || !this.state.price || !this.state.discount}
              onClick={this.addProduct} color="primary">Add Product</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={this.state.openProductEditModal} onClose={this.handleProductEditClose}>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogContent>
            <TextField name="name" value={this.state.name} onChange={this.onChange} placeholder="Product Name" /><br />
            <TextField name="desc" value={this.state.desc} onChange={this.onChange} placeholder="Description" /><br />
            <TextField name="price" type="number" value={this.state.price} onChange={this.onChange} placeholder="Price" /><br />
            <TextField name="discount" type="number" value={this.state.discount} onChange={this.onChange} placeholder="Discount" /><br />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleProductEditClose} color="primary">Cancel</Button>
            <Button disabled={!this.state.name || !this.state.desc || !this.state.price || !this.state.discount}
              onClick={this.updateProduct} color="primary">Edit Product</Button>
          </DialogActions>
        </Dialog>

        <br />
        <TableContainer>
          <TextField name="search" value={this.state.search} onChange={this.onChange} placeholder="Search by product name" />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Name</TableCell>
                <TableCell align="center">Description</TableCell>
                <TableCell align="center">Price</TableCell>
                <TableCell align="center">Discount</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(this.state.products) && this.state.products.map((row) => (
                <TableRow key={row._id}>
                  <TableCell align="center">{row.name}</TableCell>
                  <TableCell align="center">{row.desc}</TableCell>
                  <TableCell align="center">{row.price}</TableCell>
                  <TableCell align="center">{row.discount}</TableCell>
                  <TableCell align="center">
                    <Button variant="outlined" color="primary" size="small" onClick={() => this.handleProductEditOpen(row)}>Edit</Button>
                    <Button variant="outlined" color="secondary" size="small" onClick={() => this.deleteProduct(row._id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <br />
          <Pagination count={this.state.pages} page={this.state.page} onChange={this.pageChange} color="primary" />
        </TableContainer>
      </div>
    );
  }
}

export default withRouter(Dashboard);
