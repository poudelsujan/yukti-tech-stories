
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, CalendarDays } from 'lucide-react';

interface OrderFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  paymentFilter: string;
  setPaymentFilter: (value: string) => void;
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
  onClearFilters: () => void;
  showPaymentFilter?: boolean;
  isAdmin?: boolean;
}

const OrderFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  paymentFilter,
  setPaymentFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onClearFilters,
  showPaymentFilter = true,
  isAdmin = false
}: OrderFiltersProps) => {
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || dateFrom || dateTo;

  return (
    <Card className="p-6 mb-6">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={isAdmin ? "Search by order ID, customer name, or email..." : "Search by order ID..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Order Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status Filter */}
          {showPaymentFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="pending_verification">Pending Verification</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarDays className="h-4 w-4" />
            <span>Use date range to filter orders by creation date</span>
          </div>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default OrderFilters;
