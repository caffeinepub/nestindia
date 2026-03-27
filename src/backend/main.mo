import Map "mo:core/Map";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

actor {
  type PropertyType = {
    #bhk1;
    #bhk2;
    #bachelorRoom;
    #pg;
    #hostel;
    #studio;
  };

  type PropertyStatus = {
    #available;
    #rented;
  };

  type PropertyListing = {
    id : Text;
    title : Text;
    description : Text;
    propertyType : PropertyType;
    rentPerMonth : Nat;
    city : Text;
    area : Text;
    address : Text;
    amenities : [Text];
    contactPhone : Text;
    ownerName : Text;
    ownerId : Principal;
    status : PropertyStatus;
    isFeatured : Bool;
    viewCount : Nat;
    images : [Storage.ExternalBlob];
    createdAt : Int;
  };

  module PropertyListing {
    public func compareByViewCount(listing1 : PropertyListing, listing2 : PropertyListing) : Order.Order {
      Int.compare(listing2.viewCount, listing1.viewCount);
    };

    public func compare(listing1 : PropertyListing, listing2 : PropertyListing) : Order.Order {
      Text.compare(listing1.id, listing2.id);
    };
  };

  type PropertyListingInput = {
    title : Text;
    description : Text;
    propertyType : PropertyType;
    rentPerMonth : Nat;
    city : Text;
    area : Text;
    address : Text;
    amenities : [Text];
    contactPhone : Text;
    ownerName : Text;
    images : [Storage.ExternalBlob];
  };

  type SearchFilters = {
    city : ?Text;
    propertyType : ?PropertyType;
    minRent : ?Nat;
    maxRent : ?Nat;
    keyword : ?Text;
  };

  type UserProfile = {
    name : Text;
    phone : ?Text;
    role : Text; // "owner" or "tenant"
  };

  module PropertyType {
    public func toText(pt : PropertyType) : Text {
      switch (pt) {
        case (#bhk1) { "1BHK" };
        case (#bhk2) { "2BHK" };
        case (#bachelorRoom) { "Bachelor Room" };
        case (#pg) { "PG" };
        case (#hostel) { "Hostel" };
        case (#studio) { "Studio" };
      };
    };
  };

  module PropertyStatus {
    public func toText(ps : PropertyStatus) : Text {
      switch (ps) {
        case (#available) { "Available" };
        case (#rented) { "Rented" };
      };
    };
  };

  // Storage
  let propertyListings = Map.empty<Text, PropertyListing>();
  let favorites = Map.empty<Principal, Set.Set<Text>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Authorization and Storage
  let accessControlState = AccessControl.initState();
  include MixinStorage();
  include MixinAuthorization(accessControlState);

  // Helper Functions
  func getListingInternal(id : Text) : PropertyListing {
    switch (propertyListings.get(id)) {
      case (null) { Runtime.trap("Listing not found)"); };
      case (?listing) { listing };
    };
  };

  func hasPermissionToListing(caller : Principal, listing : PropertyListing) : Bool {
    caller == listing.ownerId or AccessControl.isAdmin(accessControlState, caller);
  };

  func filterListings(listings : [PropertyListing], filters : SearchFilters) : [PropertyListing] {
    listings.filter(
      func(listing) {
        switch (filters.city) {
          case (null) {};
          case (?city) { if (listing.city != city) { return false } };
        };
        switch (filters.propertyType) {
          case (null) {};
          case (?ptype) { if (listing.propertyType != ptype) { return false } };
        };
        switch (filters.minRent) {
          case (null) {};
          case (?min) { if (listing.rentPerMonth < min) { return false } };
        };
        switch (filters.maxRent) {
          case (null) {};
          case (?max) { if (listing.rentPerMonth > max) { return false } };
        };
        switch (filters.keyword) {
          case (null) {};
          case (?kw) {
            if (
              not listing.title.contains(#text(kw)) and
              not listing.description.contains(#text(kw))
            ) {
              return false;
            };
          };
        };
        true;
      }
    );
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Create Listing
  public shared ({ caller }) func createPropertyListing(input : PropertyListingInput) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };
    let id = caller.toText() # "_" # Time.now().toText();
    let listing : PropertyListing = {
      input with
      id;
      ownerId = caller;
      status = #available;
      isFeatured = false;
      viewCount = 0;
      createdAt = Time.now();
    };
    propertyListings.add(id, listing);
    id;
  };

  // Update Listing
  public shared ({ caller }) func updatePropertyListing(id : Text, input : PropertyListingInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update listings");
    };
    let existingListing = getListingInternal(id);
    if (not hasPermissionToListing(caller, existingListing)) {
      Runtime.trap("Not authorized to update this listing");
    };
    let updatedListing : PropertyListing = {
      id;
      title = input.title;
      description = input.description;
      propertyType = input.propertyType;
      rentPerMonth = input.rentPerMonth;
      city = input.city;
      area = input.area;
      address = input.address;
      amenities = input.amenities;
      contactPhone = input.contactPhone;
      ownerName = input.ownerName;
      ownerId = existingListing.ownerId;
      status = existingListing.status;
      isFeatured = existingListing.isFeatured;
      viewCount = existingListing.viewCount;
      images = input.images;
      createdAt = existingListing.createdAt;
    };
    propertyListings.add(id, updatedListing);
  };

  // Delete Listing
  public shared ({ caller }) func deletePropertyListing(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete listings");
    };
    let listing = getListingInternal(id);
    if (not hasPermissionToListing(caller, listing)) {
      Runtime.trap("Not authorized to delete this listing");
    };
    propertyListings.remove(id);
  };

  // Get Single Listing (increments view count)
  public shared ({ caller }) func getPropertyListing(id : Text) : async PropertyListing {
    let listing = getListingInternal(id);
    let updatedListing = { listing with viewCount = listing.viewCount + 1 };
    propertyListings.add(id, updatedListing);
    updatedListing;
  };

  // Search Listings
  public query ({ caller }) func searchPropertyListings(filters : SearchFilters) : async [PropertyListing] {
    let allListings = propertyListings.values().toArray().sort();
    filterListings(allListings, filters);
  };

  // Get Listings by Owner
  public query ({ caller }) func getListingsByOwner(ownerId : Principal) : async [PropertyListing] {
    propertyListings.values().toArray().filter(
      func(listing) {
        listing.ownerId == ownerId;
      }
    );
  };

  // Get Listing by ID (query, no view count increment)
  public query ({ caller }) func getListing(id : Text) : async PropertyListing {
    getListingInternal(id);
  };

  // Get All Listings (query)
  public query ({ caller }) func getAllListings() : async [PropertyListing] {
    propertyListings.values().toArray();
  };

  // Add to Favorites
  public shared ({ caller }) func addToFavorites(listingId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add favorites");
    };
    ignore getListingInternal(listingId);
    let userFavorites = switch (favorites.get(caller)) {
      case (null) { Set.empty<Text>() };
      case (?fav) { fav };
    };
    userFavorites.add(listingId);
    favorites.add(caller, userFavorites);
  };

  // Remove from Favorites
  public shared ({ caller }) func removeFromFavorites(listingId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove favorites");
    };
    let userFavorites = switch (favorites.get(caller)) {
      case (null) { Runtime.trap("No favorites found") };
      case (?fav) { fav };
    };
    userFavorites.remove(listingId);
    favorites.add(caller, userFavorites);
  };

  // Get User Favorites
  public query ({ caller }) func getUserFavorites() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view favorites");
    };
    switch (favorites.get(caller)) {
      case (null) { [] };
      case (?fav) { fav.toArray() };
    };
  };

  // Admin: Mark Listing as Rented
  public shared ({ caller }) func markListingRented(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let listing = getListingInternal(id);
    let updatedListing = { listing with status = #rented };
    propertyListings.add(id, updatedListing);
  };

  // Admin: Mark Listing as Available
  public shared ({ caller }) func markListingAvailable(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let listing = getListingInternal(id);
    let updatedListing = { listing with status = #available };
    propertyListings.add(id, updatedListing);
  };

  // Get Property Types
  public query ({ caller }) func getPropertyTypes() : async [Text] {
    [
      PropertyType.toText(#bhk1),
      PropertyType.toText(#bhk2),
      PropertyType.toText(#bachelorRoom),
      PropertyType.toText(#pg),
      PropertyType.toText(#hostel),
      PropertyType.toText(#studio),
    ];
  };

  // Get Listing Count Per City
  public query ({ caller }) func getListingCountByCity() : async [(Text, Nat)] {
    let cityCounts = Map.empty<Text, Nat>();
    for (listing in propertyListings.values()) {
      let city = listing.city;
      let currentCount = switch (cityCounts.get(city)) {
        case (null) { 0 };
        case (?count) { count };
      };
      cityCounts.add(city, currentCount + 1);
    };
    cityCounts.toArray();
  };

  // Get Most Viewed Listings
  public query ({ caller }) func getMostViewedListings(limit : Nat) : async [PropertyListing] {
    let allListings = propertyListings.values().toArray();
    let sortedListings = allListings.sort(PropertyListing.compareByViewCount);
    let end = if (limit > sortedListings.size()) {
      sortedListings.size();
    } else {
      limit;
    };
    sortedListings.sliceToArray(0, end);
  };
};
