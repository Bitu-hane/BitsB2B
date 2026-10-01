import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Catalog & Products')
@Controller('v1/catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get active B2B product categories' })
  getCategories() {
    return this.catalogService.getCategories();
  }

  @Post('categories/subcategories')
  @ApiOperation({ summary: 'Listings Moderator / Admin: Instantly add a subcategory under an existing vertical' })
  createSubcategory(@Body() body: { parentId: string; name: string; icon?: string }, @Req() req: any) {
    const actorId = req?.user?.sub || req?.user?.id;
    return this.catalogService.createSubcategory(body.parentId, body.name, body.icon, actorId);
  }

  @Post('categories/top-level')
  @ApiOperation({ summary: 'Super Admin: Instantly create a top-level category vertical' })
  createTopLevelCategory(@Body() body: { name: string; description?: string; icon?: string }, @Req() req: any) {
    const actorId = req?.user?.sub || req?.user?.id;
    return this.catalogService.createTopLevelCategory(body.name, body.description, body.icon, actorId);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Super Admin / Moderator: Edit category name, description or icon' })
  updateCategory(@Param('id') id: string, @Body() body: { name: string; description?: string; icon?: string }, @Req() req: any) {
    const actorId = req?.user?.sub || req?.user?.id;
    return this.catalogService.updateCategory(id, body.name, body.description, body.icon, actorId);
  }

  @Patch('categories/:id/cover-image')
  @ApiOperation({ summary: 'Listings Moderator / Admin: Pin or reset subcategory cover photo' })
  pinCategoryCoverImage(@Param('id') id: string, @Body() body: { coverImage: string | null }, @Req() req: any) {
    const actorId = req?.user?.sub || req?.user?.id;
    return this.catalogService.pinCategoryCoverImage(id, body.coverImage, actorId);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Super Admin / Moderator: Delete category vertical or subcategory' })
  deleteCategory(@Param('id') id: string, @Req() req: any) {
    const actorId = req?.user?.sub || req?.user?.id;
    return this.catalogService.deleteCategory(id, actorId);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get product catalog listings' })
  getProducts(
    @Query('categoryId') categoryId?: string,
    @Query('sellerBusinessId') sellerBusinessId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.catalogService.getProducts({ categoryId, sellerBusinessId, status, search });
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get single product details' })
  getProductById(@Param('id') id: string) {
    return this.catalogService.getProductById(id);
  }

  @Post('products')
  @ApiOperation({ summary: 'Seller: Create new wholesale product listing' })
  createProduct(@Body() dto: CreateProductDto, @Req() req: any) {
    const userId = req.user?.sub;
    return this.catalogService.createProduct(dto, userId);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Seller: Update product details/stock' })
  updateProduct(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    return this.catalogService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Seller: Delete product listing' })
  deleteProduct(@Param('id') id: string) {
    return this.catalogService.deleteProduct(id);
  }

  @Get('sellers/:id')
  @ApiOperation({ summary: 'Get seller business profile details & products' })
  getSellerById(@Param('id') id: string) {
    return this.catalogService.getSellerById(id);
  }
}
